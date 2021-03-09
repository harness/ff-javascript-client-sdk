import jwt_decode from 'jwt-decode';
import fetch from 'isomorphic-unfetch';
import browserPlatform from './browserPlatform';
import { defaultConfiguration, Options } from './configuration';

export interface Target {
  identifier: string;
  name?: string;
  anonymous?: boolean;
  attributes?: object;
}

interface AuthResponse {
  authToken: string;
}

interface JWTDecoded {
  environment: string;
}

export interface Message {
  event: string;
  domain: string;
  identifier: string;
  version: number;
}

type Event = 'connected' | 'disconnected' | 'reconnected' | 'changed' | 'error';
type CallbackEvent = Evaluation[] | Error | undefined;

export type Callback = (event: CustomEvent<CallbackEvent>) => void;

export interface Evaluation {
  flag: string;
  value: string;
}

export interface Result {
  on: (event: Event, callback: Callback) => void;
  off: (event: Event, callback: Callback) => void;
  variation: (identifier: string, defaultValue: any) => string | number | object;
  close: () => void;
}

const initialize = (apiKey: string, target: Target, options: Options): Result => {
  const platform = browserPlatform();
  const logger = platform.logger;
  const configurations = { ...defaultConfiguration, ...options };

  let environment: string;
  let eventSource: any;
  let jwtToken: string;
  let streamConnected = false;
  let error: Error;

  authenticate(apiKey, configurations)
    .then((token: string) => {
      jwtToken = token;
      const decoded: JWTDecoded = jwt_decode(token);
      if (configurations.debug) logger.info('authenticated');
      environment = decoded.environment;
      initialiazitionFinished();
    })
    .catch((err) => {
      error = err;
      if (configurations.debug) logger.error('Authentication error: ', error);
    });

  const fetchFlags = async () => {
    try {
      platform.eventBus.emit('loading', true);
      const res = await fetch(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations`,
      );
      const data = await res.json();
      data.forEach((elem: Evaluation) => {
        platform.localStorage.set(elem.flag, elem.value);
      });
      platform.eventBus.emit('loading', false);
    } catch (err) {
      if (configurations.debug) logger.error('Features fetch operation error: ', error);
      return err;
    }
  };

  const fetchFlag = async (identifier: string) => {
    try {
      platform.eventBus.emit('loading', true);
      const res = await fetch(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations/${identifier}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );
      platform.eventBus.emit('loading', false);
      return await res.json();
    } catch (err) {
      if (configurations.debug) logger.error('Feature fetch operation error: ', error);
      return err;
    }
  };

  const startStream = () => {
    if (!configurations.streamEnabled) return;
    eventSource = platform.eventSource(`${configurations.baseUrl}/stream`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'API-Key': apiKey,
      },
    });
    eventSource.onmessage = (event: any) => {
      logger.info('Msg received', event);
    };
    eventSource.onopen = (event: any) => {
      streamConnected = true;
      if (configurations.debug) logger.info('Stream connected');
      platform.eventBus.emit('connected', event);
    };
    eventSource.onclose = (event: any) => {
      streamConnected = false;
      if (configurations.debug) logger.info('Stream disconnected');
      platform.eventBus.emit('disconnected', event);
    };
    eventSource.onerror = (event: any) => {
      if (configurations.debug) logger.error(event);
      platform.eventBus.emit('error', event);
    };
    eventSource.addEventListener('*', (msg: any) => {
      const message: Message = JSON.parse(msg.data);
      if (configurations.debug) logger.info('received on *: ', message);
      switch (message.event) {
        case 'create':
        case 'patch':
          fetchFlag(message.identifier).then((data: Evaluation) => {
            platform.localStorage.set(data.flag, data.value).then(() => {
              platform.eventBus.emit('changed', data);
              logger.info('evaluation saved', data.flag, data.value);
            });
          });
          break;
        case 'delete':
          platform.localStorage.remove(message.identifier).then(() => {
            platform.eventBus.emit('changed', message.identifier);
            logger.info('evaluation removed', message.identifier);
          });
          break;
      }
    });
  };

  const variation = async (flag: string, defaultValue: any): Promise<any> => {
    return (await platform.localStorage.get(flag)) || defaultValue;
  };

  const initialiazitionFinished = () => {
    fetchFlags()
      .then(() => {
        // start stream only when we get all evaluations
        startStream();
      })
      .catch((err) => {
        platform.eventBus.emit('error', err);
      });
    if (configurations.debug) logger.info('Finished');
    platform.eventBus.emit('ready', true);
  };

  const close = () => {
    eventSource.close();
    platform.eventBus.off();
    if (configurations.debug) logger.info('Closing client');
  };

  const on = (event: Event, callback: Callback): void => {
    platform.eventBus.on(event, callback);
  };

  const off = (event?: Event, callback?: Callback): void => {
    platform.eventBus.on(event, callback);
  };

  return {
    on,
    off,
    variation,
    close,
  };
};

const authenticate = async (clientID: string, configuration: Options): Promise<string> => {
  try {
    const response = await fetch(`${configuration.baseUrl}/client/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: clientID,
      }),
    });
    const data: AuthResponse = await response.json();
    return data.authToken;
  } catch (error) {
    return error;
  }
};

export { initialize };
