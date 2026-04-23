// Declare secrets here. Set values with: `bun sst secret set <Name> <value>`.
// Pass the Secret resource into `link: [...]` on functions that need it;
// access it at runtime via `Resource.<Name>.value`.

export const EXAMPLE_API_KEY = new sst.Secret("EXAMPLE_API_KEY");
