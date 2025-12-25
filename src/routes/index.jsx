/** @jsx jsx */
import { Hono } from 'hono';
import { jsx } from 'hono/jsx';
import { Layout } from '../components/Layout.jsx';
import { Home } from '../components/Home.jsx';
import { Other } from '../components/Other.jsx';
import { Landing } from '../components/Landing.jsx';
import { Playground } from '../components/Playground.jsx';
import { Status } from '../components/Status.jsx';

const router = new Hono();

router.get("/", (c) => {
  return c.html(
    <Layout title="Muslim All-In-One API | Platform Data Islami Terlengkap">
      <Landing />
    </Layout>
  );
});

router.get("/docs", (c) => {
  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}/v1`;
  
  return c.html(
    <Layout title="Muslim API | Documentation">
      <Home baseUrl={baseUrl} />
    </Layout>
  );
});

router.get("/other", (c) => {
  return c.html(
    <Layout title="Muslim All-in-One API | Resources">
      <Other />
    </Layout>
  );
});

router.get("/playground", (c) => {
  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}/v1`;
  
  return c.html(
    <Layout title="Muslim API | Playground">
      <Playground baseUrl={baseUrl} />
    </Layout>
  );
});

router.get("/status", (c) => {
  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}/v1`;
  
  return c.html(
    <Layout title="Muslim API | System Status">
      <Status baseUrl={baseUrl} />
    </Layout>
  );
});

export default router;
