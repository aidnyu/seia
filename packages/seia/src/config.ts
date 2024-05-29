import { existsSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import { cwd } from 'node:process'
import { z } from 'zod'
import { isObject } from './utils.js'

export type SeiaConfig = z.input<typeof SeiaConfigSchema>

export type ResolvedSeiaConfig = z.infer<typeof ResolvedSeiaConfigSchema>

const relativePath = z.custom<string>(
	val => typeof val === 'string' && !isAbsolute(val),
)

export const ResolvedSeiaConfigSchema = z.object({
	mode: z
		.enum(['development', 'production'])
		.default('production')
		.describe('Build mode'),
	root: z.string().default(cwd).describe('Absolute path to the project root'),
	paths: z
		.object({
			src: relativePath.default('src').describe('Source directory'),
			entry: relativePath
				.default(() =>
					// TODO: hardcoded path. should use config's `src` instead
					existsSync('./src/' + 'App.tsx') ? 'App.tsx' : 'App.jsx',
				)
				.describe(
					'Main entrypoint to resolve dependency graph.\nRelative to the project root.',
				),
			anchor: z
				.string()
				.regex(/^[\p{IDS}$_][\p{IDC}$]*$/v)
				.default('default')
				.describe(
					'Name of exported item to be used as a main component',
				),
			dist: relativePath
				.default('dist')
				.describe('Dist directory.\nRelative to the project root.'),
			ssr: relativePath
				.default('ssr')
				.describe('SSR output directory.\nRelative to the `dist`.'),
			rsc: relativePath
				.default('rsc')
				.describe('RSC output directory.\nRelative to the `dist`.'),
		})
		.default({}),
	serve: z
		.object({
			port: z
				.number()
				.int()
				.nonnegative()
				.lt(1 << 16)
				.default(5314)
				.describe('Port number to run SSR server'),
		})
		.default({}),
})

export const SeiaConfigSchema = ResolvedSeiaConfigSchema.omit({
	root: true,
	mode: true,
})

export const resolveSeiaConfig = (config: SeiaConfig): ResolvedSeiaConfig => {
	return ResolvedSeiaConfigSchema.parse(config)
}

// heavily inspired by: https://github.com/vitejs/vite/blob/15a6ebb414e3155583e3e9ad970afbdb598b0609/packages/vite/src/node/utils.ts#L1071-L1128
const mergeConfigRecursively = (
	defaults: Record<string, any>,
	overrides: Record<string, any>,
): Record<string, any> => {
	const merged: Record<string, any> = { ...defaults }

	for (const key in overrides) {
		const value = overrides[key]

		// ignore nullish
		if (value === undefined || value === null) continue

		const existing = merged[key]

		// accept new when existing one is nullish
		if (existing === undefined || existing === null) {
			merged[key] = value
			continue
		}

		// recursively merge objects
		if (isObject(existing) && isObject(value)) {
			merged[key] = mergeConfigRecursively(existing, value)
			continue
		}

		merged[key] = value
	}

	return merged
}

export const mergeSeiaConfig = (
	defaults: SeiaConfig,
	overrides: SeiaConfig,
): SeiaConfig => mergeConfigRecursively(defaults, overrides)

export const extendResolvedSeiaConfig = (
	defaults: ResolvedSeiaConfig,
	overrides: SeiaConfig,
): ResolvedSeiaConfig =>
	mergeConfigRecursively(defaults, overrides) as ResolvedSeiaConfig
