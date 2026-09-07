/**
 * Chatbot Drag & Anchor Management
 * Lets the widget be dragged freely and snapped to the nearest screen edge (bottom, left or right).
 */
export class ChatbotDrag {
    /**
     * Distance in px a pointer must move before a press counts as a drag rather than a click
     */
    static DRAG_THRESHOLD = 4;

    /**
     * Determine which screen edge is closest to a given point
     * @returns {'left'|'right'|'bottom'}
     */
    static getNearestEdge(pointX, pointY, viewportWidth, viewportHeight) {
        const distLeft = pointX;
        const distRight = viewportWidth - pointX;
        const distBottom = viewportHeight - pointY;
        const min = Math.min(distLeft, distRight, distBottom);

        if (min === distBottom) return 'bottom';
        return min === distLeft ? 'left' : 'right';
    }

    /**
     * Clamp a widget's rect so it stays fully inside the viewport
     */
    static clampToViewport(left, top, width, height) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return {
            left: Math.min(Math.max(left, 0), Math.max(vw - width, 0)),
            top: Math.min(Math.max(top, 0), Math.max(vh - height, 0))
        };
    }

    /**
     * Apply fixed left/top/right/bottom styles to anchor the widget flush against an edge
     * @returns {{edge: string, left: string, top: string, right: string, bottom: string}} the applied position, for persistence
     */
    static applyAnchor(widget, edge, rect, margin) {
        widget.classList.remove('anchor-left', 'anchor-right', 'anchor-bottom');
        widget.classList.add(`anchor-${edge}`);

        widget.style.left = '';
        widget.style.top = '';
        widget.style.right = '';
        widget.style.bottom = '';

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (edge === 'bottom') {
            const left = Math.min(Math.max(rect.left, margin), Math.max(vw - rect.width - margin, margin));
            widget.style.left = `${left}px`;
            widget.style.bottom = `${margin}px`;
        } else {
            const top = Math.min(Math.max(rect.top, margin), Math.max(vh - rect.height - margin, margin));
            widget.style.top = `${top}px`;
            widget.style[edge] = `${margin}px`;
        }

        return {
            edge,
            left: widget.style.left,
            top: widget.style.top,
            right: widget.style.right,
            bottom: widget.style.bottom
        };
    }

    /**
     * Re-apply a previously saved position/anchor to the widget. Works both for edge-snapped
     * positions (edge set) and free-floating ones saved with snapToEdges disabled (edge null).
     */
    static restorePosition(widget, saved) {
        if (!saved) return;

        widget.classList.remove('anchor-left', 'anchor-right', 'anchor-bottom');
        if (saved.edge) {
            widget.classList.add(`anchor-${saved.edge}`);
        }

        widget.style.left = saved.left || '';
        widget.style.top = saved.top || '';
        widget.style.right = saved.right || '';
        widget.style.bottom = saved.bottom || '';
    }

    /**
     * Re-clamp an already-anchored widget after a viewport resize
     */
    static reclampOnResize(widget, margin) {
        const rect = widget.getBoundingClientRect();
        const { left, top } = this.clampToViewport(rect.left, rect.top, rect.width, rect.height);

        if (widget.classList.contains('anchor-left') || widget.classList.contains('anchor-right')) {
            widget.style.top = `${Math.min(Math.max(top, margin), Math.max(window.innerHeight - rect.height - margin, margin))}px`;
        } else if (widget.classList.contains('anchor-bottom')) {
            widget.style.left = `${Math.min(Math.max(left, margin), Math.max(window.innerWidth - rect.width - margin, margin))}px`;
        }
    }

    /**
     * Wire up pointer-based dragging on a handle element that moves the widget container.
     * A plain click (no movement past the threshold) is left alone so existing click handlers
     * (e.g. opening the chat) keep working.
     *
     * @param {HTMLElement} widget - the `.chatbot-widget` container to move
     * @param {HTMLElement} handle - the element the user presses to start dragging
     * @param {Object} config - widget config (uses edgeMargin / snapToEdges)
     * @param {(result: {edge: string, dragged: boolean}) => void} onDragEnd - called after a drag completes
     * @returns {() => void} cleanup function
     */
    static enableDragging(widget, handle, config, onDragEnd) {
        if (!handle) return () => {};

        const margin = config.edgeMargin ?? 20;
        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let originLeft = 0;
        let originTop = 0;

        const onPointerMove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (!moved && (Math.abs(dx) > this.DRAG_THRESHOLD || Math.abs(dy) > this.DRAG_THRESHOLD)) {
                moved = true;
                widget.classList.add('dragging');
            }
            if (!moved) return;

            const rect = widget.getBoundingClientRect();
            const { left, top } = this.clampToViewport(originLeft + dx, originTop + dy, rect.width, rect.height);

            widget.classList.remove('anchor-left', 'anchor-right', 'anchor-bottom');
            widget.style.left = `${left}px`;
            widget.style.top = `${top}px`;
            widget.style.right = '';
            widget.style.bottom = '';

            e.preventDefault();
        };

        const onPointerUp = (e) => {
            if (!dragging) return;
            dragging = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            if (!moved) return;

            widget.classList.remove('dragging');

            const rect = widget.getBoundingClientRect();
            let result = { edge: null, dragged: true };

            if (config.snapToEdges) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const edge = this.getNearestEdge(centerX, centerY, window.innerWidth, window.innerHeight);
                const applied = this.applyAnchor(widget, edge, rect, margin);
                result = { ...applied, dragged: true };
            } else {
                widget.style.left = `${rect.left}px`;
                widget.style.top = `${rect.top}px`;
                result = { edge: null, left: widget.style.left, top: widget.style.top, dragged: true };
            }

            // A click event fires right after this pointerup - onClickCapture below swallows
            // it (using this same `moved` flag) so it doesn't also toggle the chat window.
            onDragEnd?.(result);
        };

        const onPointerDown = (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            // Don't start a drag from header action buttons (refresh/fullscreen/minimize/hide),
            // but still allow it when the handle itself is a button (e.g. the toggle bubble)
            const pressedButton = e.target.closest('button');
            if (pressedButton && pressedButton !== handle) return;

            const rect = widget.getBoundingClientRect();
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            originLeft = rect.left;
            originTop = rect.top;

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        };

        // Swallow the synthetic click that follows a real drag on this specific handle,
        // without affecting clicks on any other handle (e.g. dragging the header shouldn't
        // eat a later click on the toggle bubble, and vice versa).
        const onClickCapture = (e) => {
            if (moved) {
                e.stopPropagation();
                e.preventDefault();
                moved = false;
            }
        };

        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('click', onClickCapture, true);
        handle.classList.add('chatbot-draggable-handle');

        return () => {
            handle.removeEventListener('pointerdown', onPointerDown);
            handle.removeEventListener('click', onClickCapture, true);
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            handle.classList.remove('chatbot-draggable-handle');
        };
    }
}
