import { renderHook, act, waitFor } from "@testing-library/react";
import { useIndexedDb, clearEntireDatabase } from "../../hooks/useIndexedDb";
import { CHESS_USER_PROFILE_KEY } from "../../constants/localIndexedDbKeys";
import { dateToDDMMYYYY } from "../../utils/dateHelpers";

describe("useIndexedDb", () => {
  afterEach(async () => {
    await clearEntireDatabase();
    vi.restoreAllMocks();
  });

  it("should initialize with the initial value", async () => {
    const { result } = renderHook(() => useIndexedDb("test-key", "initial-value"));
    const [value, , loading] = result.current;

    expect(value).toBe("initial-value");
    expect(loading).toBe(true);
  });

  it("should save and retrieve a simple value", async () => {
    const { result } = renderHook(() =>
      useIndexedDb("test-key", "initial-value")
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false); // Wait for loading to be false
    });

    act(() => {
      result.current[1]("new-value");
    });

    await waitFor(() => {
      expect(result.current[0]).toBe("new-value");
    });

    const { result: result2 } = renderHook(() =>
      useIndexedDb("test-key", "initial-value")
    );

    await waitFor(() => {
      expect(result2.current[2]).toBe(false);
    });

    expect(result2.current[0]).toBe("new-value");
  });

  it("should update an existing value", async () => {
    const { result } = renderHook(() =>
      useIndexedDb("test-key", "initial-value")
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    act(() => {
      result.current[1]("new-value");
    });

    await waitFor(() => {
      expect(result.current[0]).toBe("new-value");
    });

    act(() => {
      result.current[1]("updated-value");
    });

    await waitFor(() => {
      expect(result.current[0]).toBe("updated-value");
    });
  });

  it("should handle different data types", async () => {
    const testCases = [
      { key: "object-key", value: { a: 1, b: 2 } },
      { key: "array-key", value: [1, 2, 3] },
      { key: "string-key", value: "hello" },
      { key: "number-key", value: 123 },
    ];

    for (const { key, value } of testCases) {
      const { result } = renderHook(() => useIndexedDb(key, null));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1](value);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(value);
      });

      const { result: result2 } = renderHook(() => useIndexedDb(key, null));

      await waitFor(() => {
        expect(result2.current[2]).toBe(false);
      });

      expect(result2.current[0]).toEqual(value);
    }
  });

  describe("CHESS_USER_PROFILE_KEY handling", () => {
    it("should normalize allActivityDates", async () => {
      const date = new Date();
      const initialProfile = {
        allActivityDates: [date.toISOString(), "01-01-2023"],
        longestStreak: 0,
      };
      const { result } = renderHook(() =>
        useIndexedDb(CHESS_USER_PROFILE_KEY, initialProfile)
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      const [profile] = result.current;
      expect(profile.allActivityDates[0]).toBe(dateToDDMMYYYY(date));
      expect(profile.allActivityDates[1]).toBe("01-01-2023");
    });

    it("should handle longestStreak", async () => {
      const initialProfile = {
        allActivityDates: [],
        longestStreak: "invalid-streak",
      };
      const { result } = renderHook(() =>
        useIndexedDb(CHESS_USER_PROFILE_KEY, initialProfile)
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      const [profile] = result.current;
      expect(profile.longestStreak).toBe(0);
    });
  });

  describe("clearEntireDatabase", () => {
    it("should clear all data from the database", async () => {
      const { result } = renderHook(() =>
        useIndexedDb("test-key", "initial-value")
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]("new-value");
      });

      await waitFor(() => {
        expect(result.current[0]).toBe("new-value");
      });

      await clearEntireDatabase();

      const { result: result2 } = renderHook(() =>
        useIndexedDb("test-key", "initial-value")
      );

      await waitFor(() => {
        expect(result2.current[2]).toBe(false);
      });

      expect(result2.current[0]).toBe("initial-value");
    });
  });

  describe("Error handling", () => {
    it("should handle errors when loading data", async () => {
      const error = new Error("Failed to load data");
      vi.spyOn(global.__mockDexieDb["keyval-store"], "get").mockRejectedValue(error);

      const { result } = renderHook(() =>
        useIndexedDb("test-key", "initial-value")
      );

      await waitFor(() => {
        expect(result.current[3]).toBe(error);
      });
    });

    it("should handle errors when saving data", async () => {
      const error = new Error("Failed to save data");
      vi.spyOn(global.__mockDexieDb["keyval-store"], "put").mockRejectedValue(error);

      const { result } = renderHook(() =>
        useIndexedDb("test-key", "initial-value")
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]("new-value");
      });

      await waitFor(() => {
        expect(result.current[3]).toBe(error);
      });
    });
  });
});