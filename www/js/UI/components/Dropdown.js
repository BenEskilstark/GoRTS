
export const dropdown = ({
  // required:
  options,        // Array<string>: list of options in the dropdown
  // optional:
  id,             // string?: id of the <select> tag
  selected,       // string?: which option should be selected, defaults to first
  displayOptions, // Array<string>?: how to display the option names
  onChange,       // (selected) => void?: callback that MUST BE AN ARROW FUNCTION
  style,          // string?: additional styling for the <select> tag
  className,      // string?: if provided, css class for the <select> tag
}) => {
  const optionTags = [];
  for (let i = 0; i < options.length; i++) {
    const val = options[i];
    optionTags.push(`
      <option value=${val}
        ${(!selected && i == 0) || (val == selected) ? 'selected="selected"' : ''}
      >
        ${displayOptions ? displayOptions[i] : options[i]}
      </option>
    `);
  }
  return `
    <select ${id ? ("id=" + id) : ""}
      ${style ? ("style=" + style) : ""}
      ${className ? ("class=" + className) : ""}
      ${onChange ? ("onchange='(" + onChange + ")(this.value)'") : ""}
    >
      ${optionTags.join("\n")}
    </select>
  `;
};
