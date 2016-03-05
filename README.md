# palettepal
Tweet him and image and he'll reply with a palette of color data inspired by your image.

This uses a javascript tool called `color-thief` under the hood, which you can find here: http://lokeshdhakar.com/projects/color-thief/

So, this is a bit confusing. Using Docker for the first time. I can't 'just' upload the dockerfile because I need the context in which it runs, as a zip file. So to deploy this to EB, I zipped the folder content into an archive file and uploaded that. I also set the envars in elastic beanstalk (I assume those'll get pushed through?)
