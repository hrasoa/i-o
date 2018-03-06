import IntersectionObserver from '../src/observer';
import Io, { getEntryId, getUniq } from '../src/io';

const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockOnIntersection = jest.fn();

jest.useFakeTimers();

jest.mock('../src/observer.js', () =>
  jest.fn().mockImplementation(() => ({
    disconnect: mockDisconnect,
    observe: mockObserve,
    unobserve: mockUnobserve,
  })));

beforeEach(() => {
  IntersectionObserver.mockClear();
  mockDisconnect.mockClear();
  mockObserve.mockClear();
  mockUnobserve.mockClear();
  mockOnIntersection.mockClear();
});

describe('test utilities', () => {
  test('should return uniq ids', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(getUniq()).not.toEqual(getUniq());
    }
  });

  test('should return an io id', () => {
    expect(getEntryId()).toMatch(/^io-[\w]{9}$/);
  });
});

describe('test the constructor', () => {
  test('should create a new instance of Io with default options', () => {
    const io = new Io();
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(IntersectionObserver.mock.calls[0][1]).toEqual({});
    expect(io.options).toEqual({
      observer: {},
      once: true,
      onIntersection: null,
      delay: 800,
      intersectionTime: 250,
    });
    expect(io.entries).toEqual({});
    expect(io.api.disconnect).toBeDefined();
    expect(io.api.observe).toBeDefined();
    expect(io.api.unobserve).toBeDefined();
  });

  test('should create a new instance of Io with custom options', () => {
    const io = new Io({
      once: false,
      observer: { root: '#root' },
    });
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(IntersectionObserver.mock.calls[0][0].name).toEqual('bound handleIntersection');
    expect(IntersectionObserver.mock.calls[0][1]).toEqual({ root: '#root' });
    expect(io.options).toEqual({
      observer: { root: '#root' },
      once: false,
      onIntersection: null,
      delay: 800,
      intersectionTime: 250,
    });
  });
});

describe('test the mehtods', () => {
  let io;
  beforeEach(() => {
    io = new Io();
  });

  test('should not error when api is not defined', () => {
    io.api = null;
    io.disconnect();
    io.observe();
    io.unobserve();
    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
    expect(mockUnobserve).not.toHaveBeenCalled();
  });

  test('disconnect should have been called once', () => {
    io.disconnect();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  test('should observe an element', () => {
    const target = document.createElement('div');
    io.observe(target);
    const id = target.getAttribute('data-io-id');
    expect(id).toMatch(/^io-[\w]{9}$/);
    expect(io.entries[id]).toEqual({ options: {} });
    expect(mockObserve).toHaveBeenCalledWith(target);
  });

  test('should unobserve an element', () => {
    const target = document.createElement('div');
    io.observe(target);
    const id = target.getAttribute('data-io-id');
    expect(io.entries[id]).toBeDefined();
    io.unobserve(target);
    expect(io.entries[id]).toBeUndefined();
    expect(mockUnobserve).toHaveBeenCalledWith(target);
  });

  test('should call the interaction callback and unobserve', () => {
    const target = document.createElement('div');
    io.observe(target);
    io.onIntersection({ time: 0, target }, { once: true, onIntersection: mockOnIntersection });
    expect(mockOnIntersection).toHaveBeenCalledWith({ time: 0, target });
    expect(mockUnobserve).toHaveBeenCalledWith(target);
  });

  test('should call the interaction callback and not unobserve', () => {
    const target = document.createElement('div');
    io.observe(target);
    io.onIntersection({ time: 0, target }, { once: false, onIntersection: mockOnIntersection });
    expect(mockOnIntersection).toHaveBeenCalledWith({ time: 0, target });
    expect(mockUnobserve).not.toHaveBeenCalled();
  });

  test('should call handleEntryIntersection for each entries', () => {
    const spy = jest.spyOn(io, 'handleEntryIntersection');
    spy.mockImplementation(() => null);
    io.handleIntersection([{ target: 'target1' }, { target: 'target2' }]);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual({ target: 'target2' });
    expect(spy.mock.calls[1][0]).toEqual({ target: 'target1' });
  });
});

describe('test the intersection behaviors', () => {
  let spyOnIntersection;
  let io;
  let target;

  beforeEach(() => {
    io = new Io();
    if (spyOnIntersection) spyOnIntersection.mockClear();
    spyOnIntersection = jest.spyOn(io, 'onIntersection');
    target = document.createElement('div');
    io.observe(target);
  });

  it('should not call the callback as the target is not intersected', () => {
    const targetId = target.getAttribute('data-io-id');
    const entry = { target, time: 0, isIntersecting: false };
    io.handleEntryIntersection(entry);
    expect(io.entries[targetId].timerId).toBeUndefined();
    expect(setTimeout).not.toHaveBeenCalled();
    expect(spyOnIntersection).not.toHaveBeenCalled();
  });

  it('should not call the callback as the user scrolls quickly', () => {
    const targetId = target.getAttribute('data-io-id');
    // the target srolls in at t1 = 100
    io.handleEntryIntersection({ target, time: 100, isIntersecting: true });
    jest.advanceTimersByTime(100);
    expect(io.entries[targetId].timerId).toBeDefined();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 800);
    expect(spyOnIntersection).not.toHaveBeenCalled();

    // the target scolls out at t2 = 200
    io.handleEntryIntersection({ target, time: 200, isIntersecting: false });
    jest.advanceTimersByTime(100);

    // We are under the intersectionTime (delta t2 - t1 < 250) or the delay (800ms),
    // so the callback cannot be called.
    // Advence the timer after the 800ms to see of the callback is called
    // But it shouldn't as clearTimeout was called
    expect(clearTimeout).toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(spyOnIntersection).not.toHaveBeenCalled();
  });

  it('should call the callback as target is intersected and the user scrolls slower', () => {
    const targetId = target.getAttribute('data-io-id');
    io.handleEntryIntersection({ target, time: 0, isIntersecting: false });

    // the target srolls in at t1 = 100
    io.handleEntryIntersection({ target, time: 100, isIntersecting: true });
    jest.advanceTimersByTime(100);
    expect(io.entries[targetId].timerId).toBeDefined();
    expect(setTimeout).toHaveBeenCalled();
    expect(spyOnIntersection).not.toHaveBeenCalled();

    // The user stays on the target for enough time
    jest.advanceTimersByTime(1000);
    expect(spyOnIntersection).toHaveBeenCalledWith({
      target,
      time: 100,
      isIntersecting: true,
    }, {
      observer: {},
      once: true,
      onIntersection: null,
      delay: 800,
      intersectionTime: 250,
    });
  });

  it('should call the callback with custom options', () => {
    const anotherTarget = document.createElement('div');
    io.observe(anotherTarget, { once: false, delay: 300 });
    const targetId = anotherTarget.getAttribute('data-io-id');
    io.handleEntryIntersection({ target: anotherTarget, time: 0, isIntersecting: false });

    // the target srolls in at t1 = 100
    io.handleEntryIntersection({ target: anotherTarget, time: 100, isIntersecting: true });
    jest.advanceTimersByTime(100);
    expect(io.entries[targetId].timerId).toBeDefined();
    expect(setTimeout).toHaveBeenCalled();
    expect(spyOnIntersection).not.toHaveBeenCalled();

    // The user stays on the target for enough time
    jest.advanceTimersByTime(1000);
    expect(spyOnIntersection).toHaveBeenCalledWith({
      target: anotherTarget,
      time: 100,
      isIntersecting: true,
    }, {
      observer: {},
      once: false,
      onIntersection: null,
      delay: 300,
      intersectionTime: 250,
    });
  });
});
