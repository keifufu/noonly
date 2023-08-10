declare module 'sync-storage' {
	export function init(): Promise<any>
	export function set(key: string, value: any): Promise<void>
	export function get(key: string): any
	export function remove(key: string): Promise<any>
	export function saveItem(items: string[]): void
	export function getAllKeys(): any[]
}