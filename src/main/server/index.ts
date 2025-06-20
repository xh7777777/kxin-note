import koa from 'koa';
import router from './router';
import koaCors from 'koa-cors';
import koaBody from 'koa-body';
// import koaBouncer from 'koa-bouncer';

const app = new koa();

app.use(koaCors());
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

export function startServer() {
  app.listen(3015, () => {
    console.log('服务器已启动，监听端口: 3015');
  });
}
