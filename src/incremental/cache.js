/* cache.optimized.js */

class Lazy {
  // sentinel so `undefined` can be a valid cached result
  static NO_VALUE = Symbol("no_value");

  // global registry of all created Lazy instances (Set => faster add/delete, no duplicates)
  static _registrar = new Set();

  // event -> Set<Lazy>; we attach exactly one event handler per event
  static _eventMap = new Map();

  // event -> handler function (so we can remove it if an 'off' method exists)
  static _eventHandlers = new Map();

  constructor(getValue) {
    this._getValue = getValue;
    this._value = Lazy.NO_VALUE; // not computed yet
    this._events = null; // lazily-created Set of events this instance is subscribed to
    Lazy._registrar.add(this);
  }

  static invalidateAll() {
    // local var micro-optimization for hot loops
    const reg = Lazy._registrar;
    for (const obj of reg) {
      obj.invalidate();
    }
  }

  get value() {
    // fast check using sentinel
    let v = this._value;
    if (v === Lazy.NO_VALUE) {
      v = this._getValue();
      this._value = v;
    }
    return v;
  }

  invalidate() {
    this._value = Lazy.NO_VALUE;
  }

  /**
   * Subscribe this Lazy instance to invalidate when any of the supplied events occur.
   * Optimization: one handler per event invalidates all subscribers for that event,
   * avoiding a closure per Lazy per event.
   *
   * @return {Lazy}
   */
  invalidateOn(...events) {
    if (!this._events) this._events = new Set();

    for (const ev of events) {
      if (this._events.has(ev)) continue; // already subscribed

      this._events.add(ev);

      let subscribers = Lazy._eventMap.get(ev);
      if (!subscribers) {
        subscribers = new Set();
        Lazy._eventMap.set(ev, subscribers);

        // one handler per event; it will iterate that event's subscribers and invalidate them.
        const handler = () => {
          const subs = Lazy._eventMap.get(ev);
          if (!subs) return;
          for (const l of subs) l.invalidate();
        };

        Lazy._eventHandlers.set(ev, handler);

        // Register the handler once with EventHub.
        // If EventHub.logic.on is synchronous and cheap, this is fine.
        // If your EventHub returns an unsubscribe function instead of having .off, you can adapt.
        if (typeof EventHub !== "undefined" && EventHub.logic && typeof EventHub.logic.on === "function") {
          EventHub.logic.on(ev, handler);
        } else {
          // graceful fallback: still keep the mapping, but we cannot hook the hub here.
          // (This keeps code resilient if EventHub isn't defined at module load time.)
        }
      }

      subscribers.add(this);
    }

    return this;
  }

  /**
   * Stop tracking this Lazy: removes it from the global registrar and unsubscribes
   * from all events it had registered to (and also removes event handlers if no
   * subscribers remain).
   */
  dispose() {
    // remove from registrar
    Lazy._registrar.delete(this);

    if (!this._events) return;

    for (const ev of this._events) {
      const subs = Lazy._eventMap.get(ev);
      if (!subs) continue;
      subs.delete(this);
      if (subs.size === 0) {
        // no more subscribers -> remove mapping and unregister handler if possible
        Lazy._eventMap.delete(ev);
        const handler = Lazy._eventHandlers.get(ev);
        Lazy._eventHandlers.delete(ev);
        if (handler && typeof EventHub !== "undefined" && EventHub.logic && typeof EventHub.logic.off === "function") {
          // only call .off if it exists (some hubs provide off)
          EventHub.logic.off(ev, handler);
        }
      }
    }

    this._events = null;
  }
}

window.Lazy = Lazy;

// Export the same GameCache placeholder
export const GameCache = {};
window.GameCache = GameCache;
export { Lazy };
