# powergrid-dynamics-simulation

"Power Grid Dynamics Simulation" MPE Application

This an adaptation of the [Interactive simulation of power grid dynamics](http://www.condynet.de/animation.html)
application by Frank Hellmann and Paul Schultz for use in large touch screen kiosks in IMAGINARY exhibitions.

## Limitations

**IMPORTANT**:

Currently this app only supports 16:9 screens (e.g. 1920x1080) and nearby aspect ratios. Layout will break at
other aspect ratios and small resolutions. Hopefully they will be eventually supported. 

## Compilation

This app is built using several compilable languages:

- The HTML pages are built from **pug** template files.
- The CSS stylesheet is pre-compiled from **sass** files.
- The JS scripts are trans-compiled from **es6** (ES2015) files. 

To make any modifications re-compilation is necessary. You should install:

- **node** and **npm**
- **yarn**
- **gulp** (install globally)

Afterwards run the following in the command line:

```
yarn
```

After it runs succesfuly you can compile as needed:

- **sass (stylesheets)**
  ```
    gulp sass
  ```
  
- **pug (HTML pages)**
  ```
    gulp pug
  ```

- **scripts (ES6)**
  ```
    gulp scripts:prod
  ```
  
- **scripts (ES6, debug)**
  ```
    gulp scripts:dev
  ```

## Credits

Simulation, visualization and original design by Frank Hellmann and Paul Schultz.

New code by [Eric Londaits](eric.londaits@imaginary.org) for IMAGINARY.

## License

Licensed under GPL 3.0
 
