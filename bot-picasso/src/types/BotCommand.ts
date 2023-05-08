export interface BotCommand {
  data: any;
  execute: Function;
  autocomplete?: Function;
}
