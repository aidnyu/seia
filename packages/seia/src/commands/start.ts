import { Args, Flags } from '@oclif/core'

import { SeiaCommand } from '../command.js'
import {
	extendResolvedSeiaConfig,
	resolvedSeiaConfigSchema,
} from '../config.js'
import { serve } from '../server.js'

export default class Start extends SeiaCommand {
	static override args = {}

	static override description =
		'Starts SSR and RSC server. The project should be compiled with `seia build` first.'

	static override examples = ['<%= config.bin %> <%= command.id %>']

	static override flags = {
		port: Flags.integer({
			char: 'p',
			description:
				resolvedSeiaConfigSchema.shape.serve.removeDefault().shape.port
					.description,
		}),
	}

	public async run(): Promise<void> {
		const {
			flags: { port },
		} = await this.parse(Start)

		await serve(
			extendResolvedSeiaConfig(this.resolvedConfig, {
				serve: {
					port,
				},
			}),
		)
	}
}
