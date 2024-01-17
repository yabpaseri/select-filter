(function main() {
	/**
	 * KeyboardEventの追加
	 * @see /src/@types/keyboard-event.d.ts
	 */
	Object.defineProperty(MouseEvent.prototype, 'commandKey', {
		get() {
			const isMac = window.navigator.userAgent.includes('Mac');
			return (isMac && this.metaKey) || (!isMac && this.ctrlKey);
		},
	});
})();
