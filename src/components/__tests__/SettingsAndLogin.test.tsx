import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginView, validateLogin } from "@/components/views/LoginView";
import { SettingsView } from "@/components/views/SettingsView";
import { initialPreferences } from "@/store/slices/preferencesSlice";
import { renderWithProviders, testUser } from "@/test/utils";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => "/settings",
  useSearchParams: () => new URLSearchParams("next=//evil.com"),
}));

describe("validateLogin", () => {
  it("flags every invalid field", () => {
    expect(validateLogin({ name: " ", email: "nope", password: "123" })).toEqual({
      name: "auth.errors.name",
      email: "auth.errors.email",
      password: "auth.errors.password",
    });
  });

  it("accepts valid input", () => {
    expect(validateLogin({ name: "Amruth", email: "a@b.co", password: "secret1" })).toEqual({});
  });
});

describe("LoginView", () => {
  beforeEach(() => mockReplace.mockReset());

  it("shows accessible inline errors and does not log in", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<LoginView />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("aria-invalid", "true");
    expect(store.getState().auth.user).toBeNull();
  });

  it("logs in and ignores unsafe ?next= redirects", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<LoginView />);
    await user.type(screen.getByLabelText(/full name/i), "Amruth");
    await user.type(screen.getByLabelText(/email address/i), "amruth@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(store.getState().auth.user?.name).toBe("Amruth");
    expect(mockReplace).toHaveBeenCalledWith("/"); // not "//evil.com"
  });

  it("supports guest access", async () => {
    const { store } = renderWithProviders(<LoginView />);
    await userEvent.setup().click(screen.getByRole("button", { name: /continue as guest/i }));
    expect(store.getState().auth.user?.isGuest).toBe(true);
  });
});

describe("SettingsView", () => {
  const preloadedState = { auth: { user: testUser }, preferences: { ...initialPreferences, categories: ["technology" as const] } };

  it("toggles content preferences but keeps at least one", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<SettingsView />, { preloadedState });

    await user.click(screen.getByTestId("category-health"));
    expect(store.getState().preferences.categories).toEqual(["technology", "health"]);

    await user.click(screen.getByTestId("category-health"));
    await user.click(screen.getByTestId("category-technology")); // last one: locked
    expect(store.getState().preferences.categories).toEqual(["technology"]);
    expect(screen.getByTestId("category-technology")).toHaveAttribute("aria-disabled", "true");
  });

  it("switches theme, language and live updates", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<SettingsView />, { preloadedState });
    await user.click(screen.getByRole("button", { name: /^light$/i }));
    await user.selectOptions(screen.getByRole("combobox"), "es");
    await user.click(screen.getByRole("switch"));
    expect(store.getState().preferences).toMatchObject({ theme: "light", language: "es", liveUpdates: false });
  });

  it("saves profile changes", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<SettingsView />, { preloadedState });
    const name = screen.getByLabelText(/display name/i);
    await user.clear(name);
    await user.type(name, "New Name");
    await user.click(screen.getByRole("button", { name: /save profile/i }));
    expect(store.getState().auth.user?.name).toBe("New Name");
    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
  });
});
