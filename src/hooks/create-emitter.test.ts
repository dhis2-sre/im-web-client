import { createEmitter } from './create-emitter.ts'

describe('createEmitter', () => {
    it('hands every event of a burst to every subscriber, in order', () => {
        const emitter = createEmitter<number>()
        const first: number[] = []
        const second: number[] = []
        emitter.subscribe((event) => first.push(event))
        emitter.subscribe((event) => second.push(event))

        emitter.emit(1)
        emitter.emit(2)
        emitter.emit(3)

        expect(first).toEqual([1, 2, 3])
        expect(second).toEqual([1, 2, 3])
    })

    it('stops handing events to a subscriber once it unsubscribes', () => {
        const emitter = createEmitter<number>()
        const received: number[] = []
        const unsubscribe = emitter.subscribe((event) => received.push(event))

        emitter.emit(1)
        unsubscribe()
        emitter.emit(2)

        expect(received).toEqual([1])
    })
})
