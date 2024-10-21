import './content.scss';

declare global {
	interface HTMLInputElement {
		/** inputで絞り込みを行うselect */
		filterTarget?: HTMLSelectElement;
		/** optionの退避先 */
		store?: HTMLSelectElement;
		/** 元のoptionを再現するための情報 */
		relation?: { parent: HTMLElement; option: HTMLOptionElement }[];
	}
	interface HTMLSelectElement {
		/** selectの絞り込みを行うinput */
		filterBy?: HTMLInputElement;
		/** selectに装飾をするwrapper */
		wrappedBy?: HTMLSpanElement;
	}
}

(function main() {
	const EXCAPE_REGEXP_PATTERN_REGEX = /[.*+?^${}()|[\]\\]/g;
	const SPACE_REGEX = /\s+/g;
	const escapeRegExpPattern = (pattern: string): string => pattern.replace(EXCAPE_REGEXP_PATTERN_REGEX, '\\$&');

	function handleKeyup(ev: Event) {
		if (!(ev.target instanceof HTMLInputElement)) return;
		const selectEle = ev.target.filterTarget;
		const store = ev.target.store;
		const relation = ev.target.relation;
		if (!(selectEle && store && relation)) return;

		store.append(...[...selectEle.options]);

		if (ev.target.value === '') {
			for (const r of relation) {
				r.parent.append(r.option);
			}
		} else {
			const filter = escapeRegExpPattern(ev.target.value).replace(SPACE_REGEX, '.*');
			const filterRegExp = new RegExp(filter);
			for (const r of relation.filter((opt) => opt.option.value.match(filterRegExp) || opt.option.text.match(filterRegExp))) {
				r.parent.append(r.option);
			}
		}

		selectEle.selectedIndex = -1;
		if (selectEle.options.length === 0) {
			selectEle.wrappedBy?.classList.add('none');
		} else {
			selectEle.wrappedBy?.classList.remove('none');
		}
	}

	window.addEventListener('click', (ev: MouseEvent) => {
		// <select/> が CTRLクリックされた時に起動。
		if (!(ev.commandKey && ev.target instanceof HTMLSelectElement)) return;
		// DOMから消す
		if (ev.target.filterBy != null) {
			if (ev.target.filterBy.store && ev.target.filterBy.relation) {
				ev.target.filterBy.store.append(...[...ev.target.options]);
				for (const r of ev.target.filterBy.relation) {
					r.parent.append(r.option);
				}
				ev.target.selectedIndex = -1;
			}
			ev.target.filterBy.remove();
			ev.target.filterBy = void 0;
		}
		if (ev.target.wrappedBy != null) {
			ev.target.wrappedBy.before(ev.target);
			ev.target.wrappedBy.remove();
			ev.target.wrappedBy = void 0;
		}
		// CTRL+SHIFT+CLICKの時は、消すだけ
		if (ev.shiftKey) return;

		const store = new UIBuilder('select').custom((e) => (e.multiple = true)).done();
		const relation: HTMLInputElement['relation'] = [...ev.target.options].map((option) => ({
			option,
			parent: option.parentElement!,
		}));
		const inputEle = new UIBuilder('input').classes('webextension', 'select-tag-filter', 'filter').done();
		inputEle.filterTarget = ev.target;
		inputEle.store = store;
		inputEle.relation = relation;
		inputEle.addEventListener('input', handleKeyup);

		const spanEle = new UIBuilder('span').classes('webextension', 'select-tag-filter').done();
		ev.target.before(spanEle);
		spanEle.append(ev.target);

		ev.target.filterBy = inputEle;
		ev.target.wrappedBy = spanEle;
		ev.target.style.width = `${ev.target.offsetWidth}px`;
		ev.target.before(new UIBuilder('div').append(inputEle).done());

		inputEle.focus();
	});
})();

class UIBuilder<K extends keyof HTMLElementTagNameMap> {
	private e: HTMLElementTagNameMap[K];
	constructor(tag: K) {
		this.e = document.createElement(tag);
	}
	classes(...classes: string[]) {
		this.e.classList.add(...classes);
		return this;
	}
	custom(fn: (e: HTMLElementTagNameMap[K]) => void) {
		fn(this.e);
		return this;
	}
	append(...nodes: (string | Node)[]) {
		this.e.append(...nodes);
		return this;
	}
	done() {
		return this.e;
	}
}
