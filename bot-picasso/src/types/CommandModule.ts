export interface CommandModule {
  data: any;
  execute: (client, interaction) => Promise<void>;
  autocomplete: (client, interaction) => Promise<void>;
}
