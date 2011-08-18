#twine

##overview
twine is an [asynchronous](http://wiki.commonjs.org/wiki/Promises) [dependency inversion](http://martinfowler.com/articles/injection.html) container.  twine injects dependencies into components via [object composition](https://github.com/kriszyp/compose) - ie mixins applied before construction.

dependency inversion coupled with twine's `fibers` extension API makes twine a very powerful tool.  twine's power is exposed through a very simple configuration API that also makes twine easy to use.

```js
define(function (require) {
  // create a container
  var Twine = require('twine');
  var container = new Twine();

  // configure the container
  container.configure({
    components: [
      {
        id: 'app',
        module: 'my/app',
        deps: {
          session: 'session'
        }
      },
      {
        id: 'session',
        module: 'my/app/session'
      }
    ]
  }).then(function (container) {
    // resolve your app
    container.resolve('app').then(function (app) {
      // start your app
      app.startup();

      // NOTE: app.session will be the session component

      // ... at some time later don't forget to cleanup
      container.destroy();
    });
  });
});
```

##influences
the design of twine was influenced by [Castle Windsor](http://docs.castleproject.org/Windsor.MainPage.ashx), [Cairngorm 3](http://sourceforge.net/adobe/cairngorm/wiki/CairngormLibraries/) and [Parsley](http://www.spicefactory.org/parsley/).  those frameworks should be commended for their clear and comprehensive documentation.

##documentation
twine has a [wiki](https://github.com/cello/twine/wiki).

##bugs
you can report bugs via twine's [issue tracker](https://github.com/cello/twine/issues) on github.

##source
twine is available on [github](https://github.com/cello/twine).

##license
twine is available under the [new BSD license](https://github.com/cello/twine/blob/master/LICENSE).
Copyright (c) 2011, Cello Software, LLC.