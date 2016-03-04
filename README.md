# palettepal
Tweet him and image and he'll reply with a palette of color data inspired by your image.

This uses a javascript tool called `color-thief` under the hood, which you can find here: http://lokeshdhakar.com/projects/color-thief/

One complication is that color-thief relies on canvas-node, which itself has some pretty funky dependencies. I'm still trying to figure out how to make this run on elastic beanstalk in a sane way. I had to do the following so far:

  1) SSH into the EB instance: `eb ssh`
  2) Install all of the dependencies that canvas-node recommends here (https://github.com/Automattic/node-canvas):
    `sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel`
  3) edit .bashrc on the remote server to export the following environment variable:
    `