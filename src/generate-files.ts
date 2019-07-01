export const generateIndex = (fileName?: string) => {
  return `export * from "./${fileName}.component";`;
};

export const generateComponentFile = (fileName?: string, componentName?: string) => {
  return `
import * as React from "react";
import styles from "./${fileName}-component.module.scss";

export interface I${componentName}ComponentProps {

}

const ${componentName}Component = (props: I${componentName}ComponentProps) => {
  return ( <div className={styles["${fileName}"]}>

  </div>)
};

export { ${componentName}Component };
  `;
};
export const generateStoryBookDocumentationFile = (fileName?: string, componentName?: string) => {
  return `
import * as React from "react";

import { storiesOf } from "@storybook/react";
import { withA11y } from "@storybook/addon-a11y";
import { withProvider } from "@app/modules/core/storybook-provider";
import { ${componentName}Component } from "./${fileName}.component";

storiesOf("${componentName}", module)
  .addDecorator(withA11y)
  .addDecorator(withProvider)
  .add("Basic implementation", () => (
    <${componentName}Component />
  ));

  `;
};
export const generateTestFile = (fileName?: string, componentName?: string) => {
  return `
import React from "react";
import { shallow } from "enzyme";
import { ${componentName}Component } from "./${fileName}.component";

describe("[${componentName}]", () => {
  it("should render component without crashing", () => {
    const renderedComponent = shallow(
      <${componentName}Component />
    );
    expect(renderedComponent).toMatchSnapshot();
  });
});

  `;
};
