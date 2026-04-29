import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class PokeApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PokeAPI',
		name: 'pokeApi',
		icon: 'file:pokeApi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume PokeAPI',
		defaults: {
			name: 'PokeAPI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
		requestDefaults: {
			baseURL: 'https://pokeapi.co/api/v2',
		},
		properties: [],
	};
}
