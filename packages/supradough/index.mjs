// import _workletUrl from './dough-worklet.mjs?url'; // only for dev (breaks for production build)
import _workletUrl from './dough-worklet.mjs?audioworklet'; // only for prod (breaks in development?!)

export * from './dough.mjs';
export const workletUrl = _workletUrl;
