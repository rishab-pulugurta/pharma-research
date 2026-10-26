import { useSyncExternalStore } from 'react'
import type { EntityKind } from '../data/types'

/** Saved research lives in this browser only (localStorage). */
export interface EntityRef {
  kind: EntityKind
  id: string
}

export interface Collection {
  id: string
  name: string
  items: EntityRef[]
}

export interface Note {
  ref: EntityRef
  text: string
  updated: string
}

interface State {
  watch: EntityRef[]
  collections: Collection[]
  notes: Note[]
}

const KEY = 'pharmatlas:v1'
const empty: State = { watch: [], collections: [], notes: [] }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

let state: State = load()
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode); keep in memory for this session.
  }
  listeners.forEach((l) => l())
}

const same = (a: EntityRef, b: EntityRef) => a.kind === b.kind && a.id === b.id

export const useStore = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )

export const isWatched = (s: State, ref: EntityRef) => s.watch.some((w) => same(w, ref))

export function toggleWatch(ref: EntityRef) {
  set({ ...state, watch: isWatched(state, ref) ? state.watch.filter((w) => !same(w, ref)) : [...state.watch, ref] })
}

export function createCollection(name: string, first?: EntityRef) {
  const c: Collection = { id: crypto.randomUUID(), name, items: first ? [first] : [] }
  set({ ...state, collections: [...state.collections, c] })
  return c
}

export function toggleInCollection(cid: string, ref: EntityRef) {
  set({
    ...state,
    collections: state.collections.map((c) =>
      c.id !== cid ? c : { ...c, items: c.items.some((i) => same(i, ref)) ? c.items.filter((i) => !same(i, ref)) : [...c.items, ref] },
    ),
  })
}

export function deleteCollection(cid: string) {
  set({ ...state, collections: state.collections.filter((c) => c.id !== cid) })
}

export function saveNote(ref: EntityRef, text: string) {
  const others = state.notes.filter((n) => !same(n.ref, ref))
  set({ ...state, notes: text.trim() ? [...others, { ref, text, updated: new Date().toISOString() }] : others })
}

export const noteFor = (s: State, ref: EntityRef) => s.notes.find((n) => same(n.ref, ref))
