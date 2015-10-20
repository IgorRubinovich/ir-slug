# ir-slug

### Slug transliteration element with optional remote availability check - works with Polymer 1.0.

## Usage
Will bind to <input>, check url availability at http://localhost:5000/[slug]:
    
    <input name="el1" type="text">
    <ir-slug name="el1" slug-check-url="http://localhost:5000/[slug]"></ir-slug>

Standalone (no source element):
    
    <ir-slug name="el2" slug-check-url="http://localhost:5000/[slug]"></ir-slug>

	


<a name="native-form-integration"></a>
## Native form integration
ir-slug is using a native input placed in its lightDom, so in a form it acts just like a native input.

## Settings

| Property | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| name | String | undefined | Specifies input name that will be submitted as part of the form. if not provided will attempt to use source element's name. Otherwise access .value manually.
| slugCheckUrl | String | undefined | URL to request to check for slug availability. Use [slug] as a placeholder for the current value, e.g.: http://example.com/[slug]/ |
| source | String | "" | id of source element to reflect. if not provided will try to match by name |
| valueAttr | String | "value" | attribute on source element to process |
| onEvent | String | "keyup" | event on source element that triggers updates |
| value | String | "" | current slug value | 
| whitespaceChar | String | "-" | character to replace whitespace with |
| keepWhitespace | Boolean | false | if true will not condense multiple whitespaces into one |
| autoSuggest | Boolean | false | automatically replace the value with next available |
| msgSlugIsAvailable | String | "slug is available" | message to display when slug is available |
| msgSlugIsNotAvailable | String | "slug is not available" | message to display when slug is not available |
| transliterationTable | Object | Russian alphabet transliteration table | to transliterate a different language provide this attribute with a different object map |
| slugCheckDelay | Number | .4 | seconds to wait after last change before checking availability |

## Key todos
- Better docs
- Demo
- Tests

## Contributors
- Sandor Tokodi

## Contribution
Issues and pull requests are most welcome. Fork it [here](https://github.com/IgorRubinovich/ir-slug).

## License
[MIT](http://opensource.org/licenses/MIT)
