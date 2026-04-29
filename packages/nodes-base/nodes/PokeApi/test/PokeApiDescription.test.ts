import type { INodeExecutionData } from 'n8n-workflow';
import type { IExecuteSingleFunctions, IN8nHttpFullResponse } from 'n8n-workflow';

import {
	pokemonFields,
	pokemonOperations,
	simplifyGetPokemonResponse,
	simplifyPokemonForOutput,
} from '../PokeApiDescription';

const getOperationByValue = (value: string) =>
	(pokemonOperations[0].options as Array<Record<string, unknown>>).find(
		(operation) => operation.value === value,
	);

describe('PokeAPI declarative description', () => {
	it('configures Get Many to unwrap response.results', () => {
		const getAllOperation = getOperationByValue('getAll') as Record<string, unknown>;
		const postReceive = (
			((getAllOperation.routing as Record<string, unknown>).output as Record<string, unknown>)
				.postReceive as Array<Record<string, unknown>>
		)[0];

		expect(postReceive).toEqual({
			type: 'rootProperty',
			properties: {
				property: 'results',
			},
		});
	});

	it('configures Return All pagination to continue on next links', () => {
		const returnAllField = pokemonFields.find((field) => field.name === 'returnAll');

		expect(returnAllField?.routing).toEqual({
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ !!$response.body?.next }}',
						request: {
							qs: {
								offset:
									'={{ Number((($response.body?.next || "").match(/(?:\\?|&)offset=(\\d+)/) || [])[1] || 0) }}',
							},
						},
					},
				},
			},
		});
	});

	it('wires Get operation to simplify handler', () => {
		const getOperation = getOperationByValue('get') as Record<string, unknown>;
		const postReceive = (
			((getOperation.routing as Record<string, unknown>).output as Record<string, unknown>)
				.postReceive as Array<unknown>
		)[0];

		expect(postReceive).toBe(simplifyGetPokemonResponse);
	});
});

describe('simplifyPokemonForOutput', () => {
	it('simplifies pokemon payload to selected fields', () => {
		const input: INodeExecutionData[] = [
			{
				json: {
					id: 25,
					name: 'pikachu',
					height: 4,
					weight: 60,
					types: [{ type: { name: 'electric' } }],
					stats: [{ base_stat: 55, effort: 0, stat: { name: 'attack' } }],
					sprites: {
						front_default: 'https://pokeapi.co/media/sprites/pokemon/25.png',
						back_default: 'https://pokeapi.co/media/sprites/pokemon/back/25.png',
					},

					base_experience: 112,
					abilities: [
						{
							ability: {
								name: 'static',
								url: 'https://pokeapi.co/api/v2/ability/9/',
							},
						},
					],
				},
			},
		];

		const output = simplifyPokemonForOutput(input, true);

		expect(output).toEqual([
			{
				json: {
					id: 25,
					name: 'pikachu',
					height: 4,
					weight: 60,
					types: ['electric'],
					stats: [{ name: 'attack', base_stat: 55 }],
					sprites: { front_default: 'https://pokeapi.co/media/sprites/pokemon/25.png' },
				},
			},
		]);

		const simplifiedJson = output[0].json as Record<string, unknown>;
		expect(simplifiedJson).not.toHaveProperty('base_experience');
		expect(simplifiedJson).not.toHaveProperty('abilities');
		expect((simplifiedJson.sprites as Record<string, unknown>)?.back_default).toBeUndefined();
		expect((simplifiedJson.stats as Array<Record<string, unknown>>)[0].effort).toBeUndefined();
	});

	it('returns original items when simplify is false', () => {
		const input: INodeExecutionData[] = [
			{
				json: {
					id: 1,
					name: 'bulbasaur',
				},
			},
		];

		const output = simplifyPokemonForOutput(input, false);

		expect(output).toEqual(input);
	});

	it('handles empty arrays', () => {
		expect(simplifyPokemonForOutput([], true)).toEqual([]);
	});
});

describe('simplifyGetPokemonResponse', () => {
	const mockGetNodeParameter = jest.fn();
	const mockContext = {
		getNodeParameter: mockGetNodeParameter,
	} as unknown as IExecuteSingleFunctions;
	const mockResponse = {} as IN8nHttpFullResponse;

	beforeEach(() => {
		mockGetNodeParameter.mockReset();
	});

	it('reads simplify from node parameters and forwards to simplifier', async () => {
		mockGetNodeParameter.mockReturnValue(true);

		const items: INodeExecutionData[] = [
			{
				json: {
					id: 25,
					name: 'pikachu',
					height: 4,
					weight: 60,
					types: [{ type: { name: 'electric' } }],
					stats: [{ base_stat: 55, stat: { name: 'attack' } }],
					sprites: { front_default: 'sprite-url' },
				},
			},
		];

		const result = await simplifyGetPokemonResponse.call(mockContext, items, mockResponse);

		expect(mockGetNodeParameter).toHaveBeenCalledWith('simplify');
		expect(result).toEqual(simplifyPokemonForOutput(items, true));
	});
});
