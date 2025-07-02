---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
    name: 'HonestJS'
    text: 'A modern TypeScript web framework built on top of Hono'
    tagline: Fast, lightweight, combining robustnes of Hono with the power of NestJS style architecture.
    image:
        src: /images/honestjs.png
        alt: 'HonestJS logo'
    actions:
        - theme: brand
          text: Get Started
          link: /docs/introduction
        - theme: alt
          text: View on GitHub
          link: https://github.com/honestjs/honest

features:
    - icon: 🏗️
      title: NestJS-Inspired Architecture
      details:
          Enjoy a productive, NestJS-like development experience with decorators for controllers, services, and modules,
          all on top of the high-performance Hono framework.
    - icon: ⚡️
      title: Blazing Fast
      details:
          Built on Hono, one of the fastest web frameworks in the JS ecosystem. HonestJS is designed for speed and low
          overhead, perfect for performance-critical applications.
    - icon: 🧩
      title: Fully Extensible
      details:
          Customize your application with middleware, guards, pipes, and filters. A powerful plugin system allows for
          deep integration and extension.
    - icon: ✅
      title: Rich Feature Set
      details:
          Comes with built-in support for dependency injection, routing, versioning, and even server-side rendering with
          JSX for full-stack MVC applications.
---
