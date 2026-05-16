import { setContext, getContext } from "svelte";

const key = Symbol('scroll')

class ScrollContext {
    topId = $state('#__top__');
    markdownVisible = $state(false);
    constructor() {
    }

    setMarkdownVisible(visible: boolean) {
        this.markdownVisible = visible;
    }

    setTopId(id: string) {
        this.topId = id;
    }
}

export function setScrollContext(): ScrollContext {
    return setContext(key, new ScrollContext());
}

export function getScrollContext(): ScrollContext {
    const context = getContext<ScrollContext>(key);
    return context;
}