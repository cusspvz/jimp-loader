var Jimp = require( 'jimp' )
var qs = require( 'qs' )

var defaultOptions = {
  quality: 95,
  output: 'auto' // Accepted values ( JPEG, BMP, PNG )
}

function fetchMime ( options ) {
  var output

  if ( options.output === 'auto' ) {
    switch ( this.resourcePath ) {

      case /\.bmp/i:
        options.output = 'BMP'
        break

      case /\.png$/i:
        options.output = 'PNG'
        break

      case /\.jpe?g$/i:
      default:
        options.output = 'JPEG'
        break

    }
  }

  output = Jimp[ 'MIME_' + options.output ]

  if ( ! output ) {
    throw new Error( "Output seems not valid, please check github.com/cusspvz/jimp-loader" )
  }

  return output
}

module.exports = function ( content ) {
  this.cacheable( true )
  var cb = this.async()

  var options = Object.assign(
    {},
    defaultOptions,
    this.query.trim() === '' && {} ||
    this.query[0] === '?' && qs.parse( this.query.slice( 1 ) ) ||
    this.query && qs.parse( this.query ) ||
    {}
  )

  console.log( options )

  try {
    var MIME_OUTPUT = fetchMime.call( this, options )
  } catch ( err ) {
    return cb( err )
  }

  Jimp.read( this.resourcePath, function ( err, image ) {
    if ( err ) {
      return cb( err, null )
    }

    if ( options.resize ) {
      image.resize(
        +options.resize.width || +options.resize.w || Jimp.AUTO,
        +options.resize.height || +options.resize.h || Jimp.AUTO
      )
    }

    if ( options.quality ) {
      image.quality( options.quality )
    }

    image.getBuffer( MIME_OUTPUT, cb )
  })
}
