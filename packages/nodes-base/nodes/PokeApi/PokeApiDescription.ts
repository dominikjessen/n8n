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
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'results',
								},
							},
						],
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
		routing: {
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
		},
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
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['pokemon'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Number of results to skip before returning Pokemon',
		routing: {
			send: {
				type: 'query',
				property: 'offset',
			},
		},
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
