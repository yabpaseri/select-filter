export {};

declare global {
	interface MouseEvent {
		/** Mac: metaKey, Others: ctrlKey */
		get commandKey(): boolean;
	}
}
