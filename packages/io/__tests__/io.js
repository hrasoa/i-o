import Io, { getEntryId, getUniq } from '../src';

const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockOnIntersection = jest.fn();
const mockTakeRecords = jest.fn();

jest.useFakeTimers();

global.IntersectionObserver = jest.fn();

const mockIo = jest.spyOn(global, 'IntersectionObserver')
  .mockImplementation(() => ({
    disconnect: mockDisconnect,
    observe: mockObserve,
    unobserve: mockUnobserve,
    takeRecords: mockTakeRecords,
  }));
const mockRaf = jest.spyOn(global, 'requestAnimationFrame');
const mockCancelAf = jest.spyOn(global, 'cancelAnimationFrame');

beforeEach(() => {
  mockIo.mockClear();
  mockDisconnect.mockClear();
  mockObserve.mockClear();
  mockUnobserve.mockClear();
  mockOnIntersection.mockClear();
  mockTakeRecords.mockClear();
  mockRaf.mockClear();
  mockCancelAf.mockClear();
});

describe('test utilities', () => {
  test('should return uniq ids', () => {
    const ids = [];
    for (let i = 0; i < 1000; i += 1) {
      ids.push(getUniq());
    }
    const uniqs = [...new Set(ids)];
    expect(ids.length === uniqs.length).toBeTruthy();
  });

  test('should return an io id', () => {
    expect(getEntryId()).toMatch(/^io-[\w]{9}$/);
  });
});

describe('test the constructor', () => {
  test('should create a new instance of Io with default options', () => {
    const io = new Io();
    expect(mockIo).toHaveBeenCalledTimes(1);
    expect(io.options).toEqual({
      onIntersection: null,
      delay: 800,
      cancelDelay: 250,
    });
    expect(io.observers).toEqual({});
    expect(io.api.disconnect).toBeDefined();
    expect(io.api.observe).toBeDefined();
    expect(io.api.unobserve).toBeDefined();
    expect(io.api.takeRecords).toBeDefined();
  });

  test('should create a new instance of Io with custom options', () => {
    const io = new Io({
      delay: 400,
      observerInit: { root: '#root' },
    });
    expect(mockIo).toHaveBeenCalledTimes(1);
    expect(mockIo.mock.calls[0][0].name).toEqual('bound handleIntersection');
    expect(mockIo.mock.calls[0][1]).toEqual({ root: '#root' });
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
    io.takeRecords();
    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
    expect(mockUnobserve).not.toHaveBeenCalled();
    expect(mockTakeRecords).not.toHaveBeenCalled();
  });

  test('should observe an element', () => {
    const target = document.createElement('div');
    io.observe(target);
    expect(target.getAttribute('data-io-id')).toBeNull();
    io.observe(target, { onIntersection: jest.fn() });
    const id = target.getAttribute('data-io-id');
    expect(id).toMatch(/^io-[\w]{9}$/);
    expect(io.observers[id]).toEqual({
      options: { cancelDelay: 250, delay: 800, onIntersection: expect.any(Function) },
    });
    expect(mockObserve).toHaveBeenCalledWith(target);
  });

  test('should unobserve an element', () => {
    const target = document.createElement('div');
    io.observe(target, { onIntersection: jest.fn() });
    const id = target.getAttribute('data-io-id');
    expect(io.observers[id]).toBeDefined();
    io.unobserve(target);
    expect(mockUnobserve).toHaveBeenCalledWith(target);
  });

  test('disconnect should have been called once', () => {
    const target = document.createElement('div');
    io.observe(target, { onIntersection: jest.fn() });
    const id = target.getAttribute('data-io-id');
    io.handleEntryIntersection({ target, isIntersecting: true });
    expect(io.observers[id].timerId).toBeDefined();
    io.disconnect();
    expect(mockCancelAf).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  test('should takeRecords', () => {
    io.takeRecords();
    expect(mockTakeRecords).toHaveBeenCalledTimes(1);
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
  let io;
  let target;
  let id;
  let options;

  beforeEach(() => {
    io = new Io();
    target = document.createElement('div');
    io.observe(target, { onIntersection: mockOnIntersection });
    id = target.getAttribute('data-io-id');
    options = io.observers[id].options; // eslint-disable-line prefer-destructuring
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should call the callback with falsy isIntersecting', () => {
    const entry = { target, time: new Date().getTime(), isIntersecting: false };
    io.handleEntryIntersection(entry);
    expect(io.observers[id].timerId).toBeUndefined();
    const lastCall = mockOnIntersection.mock.calls.length - 1;
    expect(mockOnIntersection.mock.calls[lastCall][0].isIntersecting).toBeFalsy();
    expect(mockOnIntersection.mock.calls[lastCall][0].target).toEqual(target);
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

    expect(io.observers[id].timerId).toBeDefined();
    expect(mockOnIntersection).not.toHaveBeenCalled();

    // The user scrolls out under the cancelDelay
    io.handleEntryIntersection({
      target,
      time: start + (options.cancelDelay - 1),
      isIntersecting: false,
    });
    // The callback will be called with falsy isIntersecting
    const lastCall = mockOnIntersection.mock.calls.length - 1;
    expect(mockCancelAf).toHaveBeenCalledTimes(1);
    expect(mockOnIntersection.mock.calls[lastCall][0].isIntersecting).toBeFalsy();
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
    expect(io.observers[id].timerId).toBeDefined();
    expect(mockOnIntersection).not.toHaveBeenCalled();
    // The user stays on the target for enough time
    jest.runOnlyPendingTimers();
    expect(mockOnIntersection).toHaveBeenCalledTimes(1);
    const lastCall = mockOnIntersection.mock.calls.length - 1;
    expect(mockOnIntersection.mock.calls[lastCall][0].isIntersecting).toBeTruthy();
    expect(mockOnIntersection.mock.calls[lastCall][0].target).toEqual(target);
  });
});
