/* eslint-disable @typescript-eslint/naming-convention */

globalThis.__webpack_module_loading__ ||= new Map<string, unknown>()
globalThis.__webpack_module_cache__ ||= new Map<string, unknown>()
globalThis.__webpack_chunk_load__ ||= async (id: string) =>
	globalThis.__webpack_module_loading__.get(id) as unknown
globalThis.__webpack_require__ ||= (id: string) =>
	globalThis.__webpack_module_cache__.get(id) as unknown
