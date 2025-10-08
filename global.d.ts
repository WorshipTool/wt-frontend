import type messages from './content/chvalotce.d.json';
 
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}
