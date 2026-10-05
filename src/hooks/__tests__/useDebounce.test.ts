import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("only emits the value after it stops changing for the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), { initialProps: { value: "a" } });
    expect(result.current).toBe("a");

    rerender({ value: "ab" });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => jest.advanceTimersByTime(399));
    expect(result.current).toBe("a"); // still waiting: timer restarted on each keystroke

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("abc"); // intermediate "ab" was never emitted
  });
});
