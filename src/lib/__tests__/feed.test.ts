import { applyOrder, compactNumber, dedupe, interleave, moveItem, reorderSubset, timeAgo } from "@/lib/feed";
import { makeItem } from "@/test/utils";

const n = (id: string) => makeItem({ id, type: "news" });
const m = (id: string) => makeItem({ id, type: "movie" });
const s = (id: string) => makeItem({ id, type: "social" });

describe("interleave", () => {
  it("mixes sources using the 2:1:1 news/movie/social pattern", () => {
    const out = interleave({ news: [n("n1"), n("n2"), n("n3"), n("n4")], movie: [m("m1"), m("m2")], social: [s("s1"), s("s2")] });
    expect(out.map((i) => i.id)).toEqual(["n1", "n2", "m1", "s1", "n3", "n4", "m2", "s2"]);
  });

  it("keeps going when one source runs out early", () => {
    const out = interleave({ news: [n("n1")], movie: [m("m1"), m("m2"), m("m3")] });
    expect(out.map((i) => i.id)).toEqual(["n1", "m1", "m2", "m3"]);
  });

  it("returns an empty list when every source is empty", () => {
    expect(interleave({})).toEqual([]);
  });
});

describe("dedupe", () => {
  it("removes items with duplicate ids keeping the first", () => {
    const a = makeItem({ id: "a", title: "first" });
    const out = dedupe([a, makeItem({ id: "b" }), makeItem({ id: "a", title: "second" })]);
    expect(out).toHaveLength(2);
    expect(out[0].title).toBe("first");
  });
});

describe("applyOrder", () => {
  const items = ["a", "b", "c", "d"].map(n);

  it("returns items untouched when there is no custom order", () => {
    expect(applyOrder(items, [])).toBe(items);
  });

  it("puts ordered items first and appends newly loaded ones", () => {
    const out = applyOrder([...items, n("e")], ["c", "a", "b", "d"]);
    expect(out.map((i) => i.id)).toEqual(["c", "a", "b", "d", "e"]);
  });

  it("ignores ids that no longer exist", () => {
    expect(applyOrder(items, ["zzz", "d"]).map((i) => i.id)).toEqual(["d", "a", "b", "c"]);
  });
});

describe("moveItem", () => {
  it("moves forward and backward without mutating the input", () => {
    const list = [1, 2, 3, 4];
    expect(moveItem(list, 0, 2)).toEqual([2, 3, 1, 4]);
    expect(moveItem(list, 3, 0)).toEqual([4, 1, 2, 3]);
    expect(list).toEqual([1, 2, 3, 4]);
  });
});

describe("reorderSubset", () => {
  it("writes a reordered filtered subset back into its original slots", () => {
    // full: a(news) b(movie) c(news) d(movie) e(news); user swaps news a <-> e
    expect(reorderSubset(["a", "b", "c", "d", "e"], ["e", "c", "a"])).toEqual(["e", "b", "c", "d", "a"]);
  });

  it("is a plain reorder when the subset is the whole list", () => {
    expect(reorderSubset(["a", "b", "c"], ["c", "a", "b"])).toEqual(["c", "a", "b"]);
  });
});

describe("formatters", () => {
  const now = new Date("2026-01-10T12:00:00Z").getTime();
  it.each([
    ["2026-01-10T11:59:50Z", "just now"],
    ["2026-01-10T11:45:00Z", "15m"],
    ["2026-01-10T07:00:00Z", "5h"],
    ["2026-01-07T12:00:00Z", "3d"],
    ["2020-01-01T00:00:00Z", "2020"],
  ])("timeAgo(%s) = %s", (iso, expected) => {
    expect(timeAgo(iso, now)).toBe(expected);
  });

  it("never shows negative times for future dates", () => {
    expect(timeAgo("2030-01-01T00:00:00Z", now)).toBe("just now");
  });

  it("compacts large numbers", () => {
    expect(compactNumber(950)).toBe("950");
    expect(compactNumber(6100)).toBe("6.1K");
  });
});
