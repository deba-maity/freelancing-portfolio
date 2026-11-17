import * as THREE from "three";

export const exhibitImages = {};
function canvas(w = 1024, h = 640) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}
function rect(c, x, y, w, h, color, r = 0) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function text(c, s, x, y, size = 20, color = "#263d32", weight = 400) {
  c.fillStyle = color;
  c.font = weight + " " + size + 'px "DM Sans", sans-serif';
  c.fillText(s, x, y);
}
function line(c, points, color, width = 3) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  points.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p)));
  c.stroke();
}
function finish(c, key) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (key) exhibitImages[key] = c.toDataURL();
  return tex;
}

export function healthTexture(phone = false) {
  const [el, c] = canvas(phone ? 480 : 1024, phone ? 900 : 640),
    w = el.width;
  rect(c, 0, 0, w, el.height, "#f5f6ee");
  if (phone) {
    text(c, "health / planner", 35, 80, 25, "#284b36", 600);
    text(c, "A little better.", 35, 158, 40, "#284b36", 600);
    text(c, "Every day.", 35, 207, 40, "#284b36", 600);
    rect(c, 30, 253, 420, 273, "#e0ebc8", 25);
    text(c, "YOUR DAILY PROGRESS", 57, 296, 15);
    c.strokeStyle = "#b9cba1";
    c.lineWidth = 18;
    c.beginPath();
    c.arc(240, 399, 75, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = "#3e6c42";
    c.beginPath();
    c.arc(240, 399, 75, -Math.PI / 2, Math.PI * 0.9);
    c.stroke();
    text(c, "72%", 195, 413, 40, "#284b36", 600);
    text(c, "KEEP GOING", 197, 449, 12);
    text(c, "Today's focus", 35, 581, 24, "#284b36", 600);
    ["Move a little", "Eat with intention", "Stay hydrated"].forEach((s, i) => {
      rect(c, 30, 610 + i * 72, 420, 58, "#fff", 12);
      rect(c, 49, 628 + i * 72, 20, 20, i < 2 ? "#6e8c4c" : "#d9dfcf", 6);
      text(c, s, 85, 645 + i * 72, 18);
    });
    text(c, "ILLUSTRATIVE INTERFACE", 35, 873, 11, "#6f7e67");
  } else {
    rect(c, 0, 0, 202, 640, "#244936");
    text(c, "hp.", 30, 65, 40, "#eef5d6", 700);
    text(c, "HEALTH PLANNER", 30, 95, 11, "#cbdcae");
    ["Overview", "My goals", "Nutrition", "Activity", "Progress"].forEach(
      (s, i) => {
        if (i === 0) rect(c, 18, 146 + i * 61, 167, 43, "#41634a", 8);
        text(c, s, 36, 173 + i * 61, 16, "#e0e9d3");
      },
    );
    text(c, "YOUR DAILY PICTURE", 236, 48, 12, "#687e58");
    text(c, "Small steps. Better days.", 236, 93, 33, "#244936", 600);
    [
      [236, "Daily movement", "72%"],
      [488, "Nutrition goals", "3 / 4"],
      [740, "Weekly streak", "05 days"],
    ].forEach(([x, label, value]) => {
      rect(c, x, 126, 232, 125, "#e5ebd9", 13);
      text(c, label, x + 22, 162, 16);
      text(c, value, x + 22, 217, 38, "#244936", 500);
    });
    rect(c, 236, 276, 480, 280, "#fff", 14);
    text(c, "Your progress", 259, 314, 20, "#244936", 600);
    text(c, "ONE WEEK AT A TIME", 259, 341, 10, "#718061");
    [0, 1, 2].forEach((i) =>
      line(
        c,
        [
          [264, 380 + i * 57],
          [690, 380 + i * 57],
        ],
        "#e6e9df",
        1,
      ),
    );
    const ys = [0.5, 0.7, 0.4, 0.85, 0.65, 0.9, 0.95];
    ys.forEach((v, i) => {
      rect(
        c,
        272 + i * 60,
        510 - v * 140,
        28,
        v * 140,
        i === 6 ? "#335d39" : "#b5cb86",
        5,
      );
      text(
        c,
        ["M", "T", "W", "T", "F", "S", "S"][i],
        281 + i * 60,
        539,
        11,
        "#718061",
      );
    });
    rect(c, 740, 276, 232, 280, "#d2e3ae", 14);
    text(c, "A little more", 763, 320, 21, "#244936", 500);
    text(c, "consistency.", 763, 350, 21, "#244936", 500);
    c.strokeStyle = "#7f9c54";
    c.lineWidth = 16;
    c.beginPath();
    c.arc(855, 446, 57, -1.57, 4.71);
    c.stroke();
    c.strokeStyle = "#335d39";
    c.beginPath();
    c.arc(855, 446, 57, -1.57, 2.5);
    c.stroke();
    text(c, "72%", 820, 460, 32, "#244936", 600);
    text(c, "INTERFACE STUDY / PERSONAL PROJECT", 236, 603, 11, "#7b866f");
  }
  return finish(el, phone ? null : "health");
}

export function angularTexture(layer = 0) {
  const [el, c] = canvas();
  rect(c, 0, 0, 1024, 640, "#1c2741");
  rect(c, 0, 0, 1024, 49, "#26344f");
  ["#f17965", "#e3b85c", "#87b493"].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(23 + i * 21, 24, 5, 0, Math.PI * 2);
    c.fill();
  });
  text(
    c,
    ["angular / playground", "components / view", "services / data"][layer],
    124,
    31,
    14,
    "#a6b6cf",
  );
  rect(c, 0, 50, 220, 590, "#222e49");
  text(c, "EXPLORER", 25, 95, 12, "#8b9fbd");
  [
    "app",
    "  components",
    "  forms",
    "  services",
    "  routes",
    "  app.config.ts",
  ].forEach((s, i) =>
    text(c, s, 26, 145 + i * 39, 16, i === layer + 1 ? "#c1d6ff" : "#9bacc8"),
  );
  text(
    c,
    ["A working playground.", "Interfaces that adapt.", "Connected by design."][
      layer
    ],
    252,
    110,
    30,
    "#f3f4fb",
    500,
  );
  text(c, "ANGULAR 17  /  INTERFACE STUDY", 253, 143, 11, "#849dce");
  rect(c, 251, 184, 727, 102, "#314568", 10);
  text(
    c,
    ["Reactive forms", "Dynamic components", "Routing + services"][layer],
    276,
    225,
    24,
    "#d5e4ff",
    500,
  );
  text(
    c,
    "Explore the building blocks. Understand the connections.",
    276,
    258,
    15,
    "#a7bedf",
  );
  const code = [
    ["@Component({", "#b799ec"],
    ["  selector: 'app-playground',", "#a7c5ef"],
    ["  standalone: true,", "#a7c5ef"],
    ["  template: ` <ideas /> `", "#a7c5ef"],
    ["})", "#b799ec"],
    ["export class Playground {", "#b799ec"],
    ["  readonly possibilities = signal(Infinity);", "#c5dca5"],
    ["}", "#b799ec"],
  ];
  code.forEach(([s, col], i) => {
    text(c, String(i + 1), 259, 334 + i * 31, 14, "#597193");
    c.font = "16px monospace";
    c.fillStyle = col;
    c.fillText(s, 296, 334 + i * 31);
  });
  return finish(el, layer === 0 ? "angular" : null);
}

export function systemsTexture() {
  const [el, c] = canvas();
  rect(c, 0, 0, 1024, 640, "#eaf0ed");
  rect(c, 0, 0, 1024, 70, "#244443");
  text(c, "PUBLIC HEALTH / DATA WORKSPACE", 30, 44, 19, "#edf5ef", 500);
  text(c, "Complex data. Clear structure.", 38, 129, 32, "#244443", 600);
  text(c, "CONCEPTUAL ARCHITECTURE / NO PATIENT DATA", 40, 162, 11, "#6b827a");
  const labels = ["DIAGNOSTIC DATA", "VALIDATION", "DATASET LIBRARY"];
  labels.forEach((s, i) => {
    const x = 40 + i * 324;
    rect(c, x, 202, 296, 125, "#fff", 12);
    text(c, "0" + (i + 1), x + 21, 240, 18, "#648c7d");
    text(c, s, x + 21, 283, 16, "#244443", 600);
  });
  rect(c, 40, 357, 944, 228, "#dce8e1", 12);
  [
    "Disease dataset",
    "Structured records",
    "Test scenarios",
    "Dataset version",
  ].forEach((s, i) => {
    text(c, s, 63, 395 + i * 49, 16, "#244443");
    rect(c, 477, 378 + i * 49, 219, 19, "#b7cfc2", 5);
    rect(c, 733, 378 + i * 49, 113, 19, "#8caf9e", 5);
    rect(c, 881, 380 + i * 49, 69, 16, "#4e7f6d", 7);
  });
  return finish(el, "healthcare");
}

export function labelTexture(
  lines,
  {
    width = 1024,
    height = 256,
    bg = "#f3f0e5",
    color = "#303b31",
    size = 66,
    sub = "",
  } = {},
) {
  const [el, c] = canvas(width, height);
  rect(c, 0, 0, width, height, bg);
  lines.forEach((s, i) =>
    text(c, s, 45, 45 + size + i * (size + 12), size, color, 500),
  );
  if (sub) text(c, sub, 47, height - 28, 20, color);
  return finish(el);
}
