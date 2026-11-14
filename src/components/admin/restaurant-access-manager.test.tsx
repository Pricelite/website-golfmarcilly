import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RestaurantAccessManager } from "./restaurant-access-manager";

test("un compte inactif dispose d’un onglet et peut recevoir un mot de passe administrateur", () => {
  const html = renderToStaticMarkup(<RestaurantAccessManager initialUsers={[{
    id: "account-id", name: "Marine", username: "marine335", email: null,
    role: "staff", restaurantId: "la-bergerie", active: false,
    sections: ["restaurant"], createdAt: "2026-11-14T00:00:00Z",
  }]} contentAvailable />);

  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*>[\s\S]*Marine/);
  assert.match(html, /\+ Nouveau compte/);
  const button = html.match(/<button([^>]*)>Définir un mot de passe et activer<\/button>/);
  assert.ok(button);
  assert.doesNotMatch(button[1], /(?:^|\s)disabled(?:\s|=|$)/);
});
