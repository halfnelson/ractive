define([
	'parse/converters/mustache',
	'parse/Tokenizer/utils/getLowestIndex'
], function (
	getMustache,
	getLowestIndex
) {

	'use strict';

	var attributeNamePattern = /^[^\s"'>\/=]+/,
		unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/,
		onPattern = /^on/;

	return getAttribute;

	function getAttribute ( parser ) {
		var attr, name, value;

		parser.allowWhitespace();

		name = parser.matchPattern( attributeNamePattern );
		if ( !name ) {
			return null;
		}

		attr = {
			name: name
		};

		value = getAttributeValue( parser );
		if ( value ) {
			attr.value = value;
		}

		return attr;
	}

	function getAttributeValue ( parser ) {
		var start, value;

		start = parser.pos;

		parser.allowWhitespace();

		if ( !parser.matchString( '=' ) ) {
			parser.pos = start;
			return null;
		}

		parser.allowWhitespace();

		value = getQuotedAttributeValue( parser, "'" ) ||
				getQuotedAttributeValue( parser, '"' ) ||
				getUnquotedAttributeValue( parser );

		if ( value === null ) {
			parser.pos = start;
			return null;
		}

		if ( value.length === 1 && typeof value[0] === 'string' ) {
			return value[0];
		}

		return value;
	}

	function getUnquotedAttributeValueToken ( parser ) {
		var start, text, index;

		start = parser.pos;

		text = parser.matchPattern( unquotedAttributeValueTextPattern );

		if ( !text ) {
			return null;
		}

		if ( ( index = text.indexOf( parser.delimiters[0] ) ) !== -1 ) {
			text = text.substr( 0, index );
			parser.pos = start + text.length;
		}

		return text;
	}

	function getUnquotedAttributeValue ( parser ) {
		var tokens, token;

		tokens = [];

		token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
		while ( token !== null ) {
			tokens.push( token );
			token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
		}

		if ( !tokens.length ) {
			return null;
		}

		return tokens;
	}

	function getQuotedAttributeValue ( parser, quoteMark ) {
		var start, tokens, token;

		start = parser.pos;

		if ( !parser.matchString( quoteMark ) ) {
			return null;
		}

		tokens = [];

		token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
		while ( token !== null ) {
			tokens.push( token );
			token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
		}

		if ( !parser.matchString( quoteMark ) ) {
			parser.pos = start;
			return null;
		}

		return tokens;
	}

	function getQuotedStringToken ( parser, quoteMark ) {
		var start, index, remaining;

		start = parser.pos;
		remaining = parser.remaining();

		index = getLowestIndex( remaining, [ quoteMark, parser.delimiters[0], parser.delimiters[1] ] );

		if ( index === -1 ) {
			throw new Error( 'Quoted attribute value must have a closing quote' );
		}

		if ( !index ) {
			return null;
		}

		parser.pos += index;
		return remaining.substr( 0, index );
	}

});