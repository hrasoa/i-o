import IntersectionObserver from '../src/observer';
import Io, { getEntryId, getUniq } from '../src/io';

const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockOnIntersection = jest.fn();
const mockOnIntersectionOut = jest.fn();

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
  mockOnIntersectionOut.mockClear();
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
      onIntersectionOut: null,
      onIntersection: null,
      delay: 800,
      cancelDelay: 250,
    });
    expect(io.entries).toEqual({});
    expect(io.api.disconnect).toBeDefined();
    expect(io.api.observe).toBeDefined();
    expect(io.api.unobserve).toBeDefined();
  });

  test('should create a new instance of Io with custom options', () => {
    const io = new Io({
      observer: { root: '#root' },
    });
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(IntersectionObserver.mock.calls[0][0].name).toEqual('bound handleIntersection');
    expect(IntersectionObserver.mock.calls[0][1]).toEqual({ root: '#root' });
    expect(io.options).toEqual({
      observer: { root: '#root' },
      onIntersectionOut: null,
      onIntersection: null,
      delay: 800,
      cancelDelay: 250,
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
    io.unobserve(target, id);
    expect(io.entries[id]).toBeUndefined();
    expect(mockUnobserve).toHaveBeenCalledWith(target);
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
  const spyOnIntersection = jest.fn();
  const spyRaf = jest.spyOn(global, 'requestAnimationFrame');
  const spyCancelAf = jest.spyOn(global, 'cancelAnimationFrame');
  let io;
  let target;

  beforeEach(() => {
    io = new Io({
      onIntersectionOut: mockOnIntersectionOut,
    });
    spyOnIntersection.mockClear();
    spyRaf.mockClear();
    spyCancelAf.mockClear();
    target = document.createElement('div');
    io.observe(target, { onIntersection: spyOnIntersection });
  });

  it('should not call the callback as the target is not intersected', () => {
    const targetId = target.getAttribute('data-io-id');
    const entry = { target, time: new Date().getTime(), isIntersecting: false };
    io.handleEntryIntersection(entry);
    expect(io.entries[targetId].timerId).toBeUndefined();
    expect(spyOnIntersection).not.toHaveBeenCalled();
    expect(mockOnIntersectionOut.mock.calls[0][0].isIntersecting).toEqual(false);
    expect(mockOnIntersectionOut.mock.calls[0][0].target).toEqual(target);
  });

  it('should not call the callback as the user scrolls quickly', () => {
    const id = target.getAttribute('data-io-id');
    const start = new Date().getTime();
    spyRaf
      .mockImplementationOnce(cb =>
        setTimeout(() => {
          cb(start + 100);
        }));
    io.handleEntryIntersection({ target, time: start, isIntersecting: true });
    jest.runOnlyPendingTimers();
    expect(io.entries[id].timerId).toBeDefined();
    expect(spyOnIntersection).not.toHaveBeenCalled();
    spyRaf
      .mockImplementationOnce(cb =>
        setTimeout(() => {
          cb(start + 2000);
        }));
    // the target scolls out at t2 = 200
    io.handleEntryIntersection({ target, time: start + 200, isIntersecting: false });
    // We are under the cancelDelay (delta t2 - t1 < 250) or the delay (800ms),
    // so the callback cannot be called.
    expect(spyCancelAf).toHaveBeenCalledWith(1);
    // Advence the timer after the 800ms to see of the callback is called
    // But it shouldn't as cancelAnimationFrame was called
    jest.runOnlyPendingTimers();
    expect(spyOnIntersection).not.toHaveBeenCalled();
  });

  it('should call the callback as target is intersected and the user scrolls slower', () => {
    const id = target.getAttribute('data-io-id');
    const start = new Date().getTime();
    // Prepare the behavior where the user stays longer on the element
    spyRaf
      .mockImplementationOnce(cb =>
        setTimeout(() => {
          cb(start + 2000);
        }));
    // the target srolls in at t1 = 100
    io.handleEntryIntersection({ target, time: start + 100, isIntersecting: true });
    expect(io.entries[id].timerId).toBeDefined();
    expect(spyOnIntersection).not.toHaveBeenCalled();
    // The user stays on the target for enough time
    jest.runOnlyPendingTimers();
    expect(spyOnIntersection).toHaveBeenCalled();
    expect(spyOnIntersection.mock.calls[0][0].isIntersecting).toBeTruthy();
    expect(spyOnIntersection.mock.calls[0][0].target).toEqual(target);
    expect(spyOnIntersection.mock.calls[0][1].name).toEqual('bound unobserve');
  });
});
