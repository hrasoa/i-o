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
    expect(io.options).toEqual({
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
      delay: 400,
      observer: { root: '#root' },
    });
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(IntersectionObserver.mock.calls[0][0].name).toEqual('bound handleIntersection');
    expect(IntersectionObserver.mock.calls[0][1]).toEqual({ root: '#root' });
    expect(io.options).toEqual({
      onIntersection: null,
      delay: 400,
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
    expect(io.entries[id]).toEqual({
      options: { cancelDelay: 250, delay: 800, onIntersection: null },
    });
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
  const mockRaf = jest.spyOn(global, 'requestAnimationFrame');
  const mockCancelAf = jest.spyOn(global, 'cancelAnimationFrame');
  let io;
  let target;
  let id;
  let options;

  beforeEach(() => {
    io = new Io();
    mockRaf.mockClear();
    mockCancelAf.mockClear();
    target = document.createElement('div');
    io.observe(target, { onIntersection: mockOnIntersection });
    id = target.getAttribute('data-io-id');
    options = io.entries[id].options; // eslint-disable-line prefer-destructuring
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should call the callback with falsy isIntersecting', () => {
    const entry = { target, time: new Date().getTime(), isIntersecting: false };
    io.handleEntryIntersection(entry);
    expect(io.entries[id].timerId).toBeUndefined();
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][0].isIntersecting).toBeFalsy();
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][0].target).toEqual(target);
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][1].name).toEqual('bound unobserve');
  });

  it('should call the callback with falsy isIntersecting as the user scrolls quickly', () => {
    const start = new Date().getTime();
    mockRaf
      .mockImplementationOnce(cb =>
        setTimeout(() => {
          cb(start + 1);
        }));
    io.handleEntryIntersection({ target, time: start, isIntersecting: true });

    expect(mockRaf).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(mockRaf).toHaveBeenCalledTimes(2);

    expect(io.entries[id].timerId).toBeDefined();
    expect(mockOnIntersection).not.toHaveBeenCalled();

    // The user scrolls out under the cancelDelay
    io.handleEntryIntersection({ target, time: start + options.cancelDelay - 1, isIntersecting: false });
    // The callback will be called with falsy isIntersecting
    expect(mockCancelAf).toHaveBeenCalledTimes(1);
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][0].isIntersecting).toBeFalsy();
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][1].name).toEqual('bound unobserve');
  });

  it('should call the callback with truthy isIntersecting as target is intersected and the user scrolls slower', () => {
    const start = new Date().getTime();
    // Prepare the behavior where the user stays longer on the element
    mockRaf
      .mockImplementationOnce(cb =>
        setTimeout(() => {
          cb(start + options.delay);
        }));
    io.handleEntryIntersection({ target, time: start, isIntersecting: true });
    expect(io.entries[id].timerId).toBeDefined();
    expect(mockOnIntersection).not.toHaveBeenCalled();
    // The user stays on the target for enough time
    jest.runOnlyPendingTimers();
    expect(mockOnIntersection).toHaveBeenCalledTimes(1);
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][0].isIntersecting).toBeTruthy();
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][0].target).toEqual(target);
    expect(mockOnIntersection.mock.calls[mockOnIntersection.mock.calls.length - 1][1].name).toEqual('bound unobserve');
  });
});
