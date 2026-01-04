 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/scripts/validate-snapshots.js b/scripts/validate-snapshots.js
new file mode 100755
index 0000000000000000000000000000000000000000..5b0425d6a77fa2bba83b81d9b6f48c9032a96502
--- /dev/null
+++ b/scripts/validate-snapshots.js
@@ -0,0 +1,132 @@
+#!/usr/bin/env node
+/**
+ * Validate CryptoWatch snapshot files before committing them (or deploying to GitHub Pages).
+ * Ensures that market snapshots exist and contain basic required fields.
+ */
+
+const fs = require("fs");
+const path = require("path");
+
+const SNAPSHOTS = [
+  { path: path.join(__dirname, "..", "data", "market_usd.json"), label: "USD", required: true },
+  { path: path.join(__dirname, "..", "data", "market_eur.json"), label: "EUR", required: false },
+];
+
+function readJson(file) {
+  try {
+    const raw = fs.readFileSync(file, "utf-8");
+    return JSON.parse(raw);
+  } catch (e) {
+    throw new Error(`Failed to parse ${path.basename(file)}: ${e.message}`);
+  }
+}
+
+function validateSnapshot(snapshot, label) {
+  const issues = [];
+
+  if (!snapshot || typeof snapshot !== "object") {
+    issues.push("snapshot is empty or not an object");
+    return issues;
+  }
+
+  if (!snapshot.updated_at) issues.push("missing updated_at timestamp");
+  if (!snapshot.convert) issues.push("missing convert currency code");
+
+  if (!snapshot.global || !snapshot.global.data) {
+    issues.push("missing global market data block");
+  } else {
+    const global = snapshot.global.data;
+    if (typeof global.total_market_cap?.usd !== "number") {
+      issues.push("missing total_market_cap.usd");
+    }
+    if (typeof global.total_volume?.usd !== "number") {
+      issues.push("missing total_volume.usd");
+    }
+  }
+
+  if (!Array.isArray(snapshot.coins) || snapshot.coins.length === 0) {
+    issues.push("no coins found in snapshot");
+  } else {
+    snapshot.coins.forEach((coin, idx) => {
+      const prefix = `coins[${idx}]`;
+      const required = [
+        "id",
+        "symbol",
+        "name",
+        "current_price",
+        "market_cap_rank",
+        "market_cap",
+        "total_volume",
+      ];
+      for (const field of required) {
+        if (!coin || coin[field] === undefined || coin[field] === null || coin[field] === "") {
+          issues.push(`${prefix} is missing ${field}`);
+        }
+      }
+    });
+  }
+
+  if (!snapshot.trending || !Array.isArray(snapshot.trending.coins)) {
+    issues.push("missing trending coins section");
+  } else if (snapshot.trending.coins.length === 0) {
+    issues.push("trending coins list is empty");
+  } else {
+    snapshot.trending.coins.forEach((item, idx) => {
+      const coin = item?.item;
+      if (!coin) {
+        issues.push(`trending[${idx}] is missing item`);
+        return;
+      }
+      const required = ["id", "name", "symbol", "market_cap_rank"];
+      for (const field of required) {
+        if (!coin[field]) issues.push(`trending[${idx}] item missing ${field}`);
+      }
+    });
+  }
+
+  if (snapshot.convert && typeof snapshot.convert === "string") {
+    const upper = snapshot.convert.toUpperCase();
+    if (upper !== label) {
+      issues.push(`convert code "${snapshot.convert}" does not match expected ${label}`);
+    }
+  }
+
+  return issues;
+}
+
+let failed = 0;
+
+for (const snap of SNAPSHOTS) {
+  if (!fs.existsSync(snap.path)) {
+    const msg = `${path.basename(snap.path)} is missing`;
+    if (snap.required) {
+      console.error(`❌ ${msg}`);
+      failed++;
+    } else {
+      console.warn(`⚠️  ${msg} (skipped optional currency)`);
+    }
+    continue;
+  }
+
+  try {
+    const data = readJson(snap.path);
+    const issues = validateSnapshot(data, snap.label);
+    if (issues.length) {
+      failed++;
+      console.error(`❌ ${snap.label} snapshot is invalid:`);
+      for (const issue of issues) console.error(`   - ${issue}`);
+    } else {
+      console.log(`✅ ${snap.label} snapshot OK (${data.coins.length} coins)`);
+    }
+  } catch (e) {
+    failed++;
+    console.error(`❌ ${e.message}`);
+  }
+}
+
+if (failed > 0) {
+  console.error(`Snapshot validation failed (${failed} file${failed === 1 ? "" : "s"}).`);
+  process.exit(1);
+}
+
+console.log("All snapshots look valid.");
 
EOF
)
