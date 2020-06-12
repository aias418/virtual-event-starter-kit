export function getWithExpiry(key: string) {
	if (process.browser) {
		const itemStr = localStorage.getItem(key)
		// if the item doesn't exist, return null
		if (!itemStr) {
			return null
		}
		const item = JSON.parse(itemStr)
		const now = new Date()
		// compare the expiry time of the item with the current time
		if (now.getTime() > item.expiry) {
			// If the item is expired, delete the item from storage
			// and return null
			localStorage.removeItem(key)
			return null
		}
		return item.value
	}
	return null;
}

export function setWithExpiry(key: string, value: any, ttl: number) {
	if (process.browser) {
		const now = new Date()

		// `item` is an object which contains the original value
		// as well as the time when it's supposed to expire
		const item = {
			value: value,
			expiry: now.getTime() + ttl,
		}
		localStorage.setItem(key, JSON.stringify(item))
	}
}