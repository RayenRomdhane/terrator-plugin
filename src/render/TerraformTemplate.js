const macro = `{% macro displayAttributeValue(attribute, value, level) %}
{% if attribute.isVariable %}{{ value | dump | indent(level * 4, true) }},
{% elif attribute.definition.type == 'Link' %}{{ attribute.definition.linkRef | indent(level * 4, true) }}.{{ value }}.{{attribute.definition.linkAttribute}},
{% elif isValueReference(value) %}{{ value | indent(level * 4, true) }},
{% else %}{{ value | dump | indent(level * 4, true) }},
{% endif %}
{% endmacro %}
`;

const root = `${macro}{% include "local" ignore missing %}
{% include "block" ignore missing %}
{% include "variable" ignore missing %}
{% include "output" ignore missing %}
`;

const block = `{% for _block in components %}
{{ _block.definition.blockType }} {% if ['resource','data'].includes(_block.definition.blockType) %}"{{ _block.definition.type }}" {% endif %}{% if ['provider', 'module'].includes(_block.definition.blockType) %}"{{ _block.definition.type }}"{% else %}"{{ _block.id }}"{% endif %} {
{% for attribute in _block.attributes %}{% set level = 1 %}
{% include "attribute" ignore missing %}
{% endfor %}
}

{% endfor %}`;

const attribute = `
{% if attribute.type == 'Object' %}
   {% include 'attributeObject' ignore missing %}
{% elif attribute.type == 'Array' %}
   {% if attribute.definition.itemType == 'Object' %}
      {% include 'attributeArrayOfObjects' ignore missing %}
   {% else %}
      {% include 'attributeArray' ignore missing %}
   {% endif %}
{% else %}
   {{- attribute.name | indent(level * 4, true) }} = {% if attribute.isVariable %}{{ attribute.value }}
   {% elif attribute.definition.type == 'Reference' %}{{ attribute.definition.containerRef }}.{{ attribute.value }}
   {% elif attribute.type in ['Boolean', 'Number', 'String'] or attribute.name == 'user_data' %}{{ attribute.value }}
   {% elif attribute.type == 'String' and isValueReference(attribute.value) %}{{ attribute.value }}
   {% else %}
      {{- attribute.value if attribute.value !== null | dump }}
   {% endif %}
{% endif %}
`;

const attributeObject = `
{{ attribute.name | indent(level * 4, true) }} {% if not attribute.isDynamic %}= {% endif %}{
{% set level = level + 1 %}{% for attr in attribute.value %}{% set attribute = attr %}
{% include 'attribute' ignore missing %}
{% set attribute = attr %}
{% endfor %}{% set level = level - 1 %}
{{ "}" | indent(level * 4, true) }}
`;

const attributeArray = `
{{ attribute.name | indent(level * 4, true) }} = [
{% set level = level + 1 %}{% for value in attribute.value %}
{{- displayAttributeValue(attribute, value, level) }}
{% endfor %}{% set level = level - 1 %}
{{ "]" | indent(level * 4, true) }}
`;

const attributeArrayOfObjects = `
{{ attribute.name | indent(level * 4, true) }} = [
{% for item in attribute.value %}
  {% include "attributeObject" with { attribute: item, level: level } %}
  {{ "," if not loop.last }}
{% endfor %}
{{ "]" | indent(level * 4, true) }}
`;

const variable = `{% for variable in variables %}
variable {{ variable.name | dump }} {
{% set level = 1 %}
{% if variable.defaultValue %}{{ "default" | indent(level * 4, true) }} = {% if isList(variable.type) %}[
{% set level = level+1 %}{% for val in variable.defaultValue %}
{{ val | dump | indent(level * 4, true) }},
{% endfor %}
{% set level = level-1 %}{{ "]" | indent(level * 4, true) }}
{% else %}{{ variable.defaultValue | dump }}
{% endif %}
{% endif %}
{% if variable.type %}{{ "type" | indent(level * 4, true) }} = {{ variable.type }}
{% endif %}
{% if variable.description %}{{ "description" | indent(level * 4, true) }} = {{ variable.description | dump }}
{% endif %}
{% if variable.sensitive %}{{ "sensitive" | indent(level * 4, true) }} = {{ variable.sensitive }}
{% endif %}
{% if variable.nullable %}{{ "nullable" | indent(level * 4, true) }} = {{ variable.nullable }}
{% endif %}
}

{% endfor %}
`;

const output = `{% for output in outputs %}
output {{ output.name | dump }} {
{% set level = 1 %}
{% if isList(output.type) %}
{{ "value = [" | indent(level * 4, true) }}
{% for val in output.value %}
{% set level = level+1 %}
{% set argType = getListType(output.type) %}
{% if argType == 'number' or argType == 'bool' or isValueReference(val) %}
{{ val | dump  | indent(level * 4, true) }},
{% else %}
{{ val | dump  | indent(level * 4, true) }},
{% endif %}
{% set level = level-1 %}
{% endfor %}{{ "]" | indent(level * 4, true) }}
{% else %}
{{ "value = " | indent(level * 4, true) }}{% if output.type == 'number' or output.type == 'bool' or isValueReference(output.value) %}
{{ output.value }}
{% else %}
{{ output.value | dump }}
{% endif %}
{% endif %}
{% if output.description %}{{ "description" | indent(level * 4, true) }} = {{ output.description | dump }}
{% endif %}
{% if output.sensitive %}{{ "sensitive" | indent(level * 4, true) }} = {{ output.sensitive }}
{% endif %}
}

{% endfor %}
`;

const local = `{% if locals.length > 0 %}
locals {
{% set level = 1 %}
{% for local in locals %}
{% if local.value %}{{ local.name | indent(level * 4, true) }} = {% if isList(local.type) %}[
{% set level = level+1 %}{% for val in local.value %}
{{ val | dump | indent(level * 4, true) }},
{% endfor %}
{% set level = level-1 %}{{ "]" | indent(level * 4, true) }}
{% else %}{{ local.value | dump }}
{% endif %}
{% endif %}
{% endfor %}{% set level = level-1 %}
{% set level = 0 %}}

{% endif %}
`;

export default {
  root,
  block,
  attribute,
  attributeObject,
  attributeArray,
  attributeArrayOfObjects,
  variable,
  output,
  local,
};
