import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("Task 1: Project setup", () => {
  it("has package.json with next, react, tailwindcss dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8")
    );
    expect(pkg.dependencies).toHaveProperty("next");
    expect(pkg.dependencies).toHaveProperty("react");
    expect(pkg.dependencies).toHaveProperty("geist");
    expect(pkg.devDependencies).toHaveProperty("tailwindcss");
  });

  it("has components.json (shadcn/ui initialized)", () => {
    const componentsJson = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../../components.json"),
        "utf-8"
      )
    );
    expect(componentsJson).toHaveProperty("$schema");
    expect(componentsJson.tsx).toBe(true);
  });

  it("has shadcn Button component", () => {
    const button = readFileSync(
      path.resolve(__dirname, "../../components/ui/button.tsx"),
      "utf-8"
    );
    expect(button).toContain("buttonVariants");
  });

  it("has shadcn Card component", () => {
    const card = readFileSync(
      path.resolve(__dirname, "../../components/ui/card.tsx"),
      "utf-8"
    );
    expect(card).toContain("CardContent");
  });

  it("layout.tsx applies dark class and Geist font variables", () => {
    const layout = readFileSync(
      path.resolve(__dirname, "../../app/layout.tsx"),
      "utf-8"
    );
    expect(layout).toContain('className={`${geistSans.variable}');
    expect(layout).toContain("dark");
    expect(layout).toContain("bg-[#0d1117]");
  });

  it("layout.tsx has Paper2Notebook metadata title", () => {
    const layout = readFileSync(
      path.resolve(__dirname, "../../app/layout.tsx"),
      "utf-8"
    );
    expect(layout).toContain("Paper2Notebook");
  });
});
