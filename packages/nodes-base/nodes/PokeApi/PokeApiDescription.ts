import type { INodeProperties } from 'n8n-workflow';

export const pokemonOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pokemon'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a Pokemon by name or numeric ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/pokemon/{{$parameter["nameOrId"]}}',
					},
				},
				action: 'Get a pokemon',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of Pokemon',
				routing: {
					request: {
						method: 'GET',
						url: '/pokemon',
					},
				},
				action: 'Get many pokemon',
			},
		],
		default: 'getAll',
	},
];

export const pokemonFields: INodeProperties[] = [
	{
		displayName: 'Name or ID',
		name: 'nameOrId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. pikachu or 25',
		displayOptions: {
			show: {
				resource: ['pokemon'],
				operation: ['get'],
			},
		},
		description: 'Name (lowercase) or numeric ID of the Pokemon to retrieve',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['pokemon'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['pokemon'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['pokemon'],
				operation: ['get'],
			},
		},
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];
