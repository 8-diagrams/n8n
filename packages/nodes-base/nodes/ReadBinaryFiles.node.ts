import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { promises as fs } from 'fs';
import * as glob from 'glob-promise';
import * as path from 'path';

export class ReadBinaryFiles implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Read Binary Files',
		name: 'readBinaryFiles',
		group: ['input'],
		version: 1,
		description: 'Reads binary files from disk',
		defaults: {
			name: 'Read Binary Files',
			color: '#22CC33',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'File Selector',
				name: 'fileSelector',
				type: 'string',
				default: '',
				required: true,
				noDataExpression: true,
				placeholder: '*.jpg',
				description: 'Pattern for files to read.',
			},
			{
				displayName: 'Property Name',
				name: 'dataPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				noDataExpression: true,
				description: 'Name of the binary property to which to<br />write the data of the read files.',
			},
		]
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const fileSelector = this.getNodeParameter('fileSelector', 0) as string;
		const dataPropertyName = this.getNodeParameter('dataPropertyName', 0) as string;

		const files = await glob(fileSelector);

		const items: INodeExecutionData[] = [];
		let item: INodeExecutionData;
		let data: Buffer;
		let fileName: string;
		for (const filePath of files) {
			data = await fs.readFile(filePath) as Buffer;

			fileName = path.parse(filePath).base;
			item = {
				binary: {
					[dataPropertyName]: await this.helpers.prepareBinaryData(data, fileName)
				},
				json: {},
			};

			items.push(item);
		}

		return this.prepareOutputData(items);
	}
}