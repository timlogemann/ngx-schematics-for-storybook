import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import './createSchema';

const collectionPath = join(__dirname, '../collection.json');

describe('component', () => {
  const runner = new SchematicTestRunner('ngx-schematics-for-storybook', collectionPath);
  const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };
  const appOptions = {
    name: 'baz',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
    skipPackageJson: false,
  };
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = runner.runSchematic('workspace', workspaceOptions);
    appTree = runner.runSchematic('application', appOptions, appTree);
  });
  it('should create stories for a component', () => {
    const tree = runner.runSchematic('component', { name: 'foo/bar', project: 'baz' }, appTree);
    expect(tree.readContent('/projects/baz/src/stories/foo/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';
import { BarComponent } from '../../app/foo/bar/bar.component';

storiesOf('foo/BarComponent', module)
  .add('default', () => ({
    component: BarComponent
  }));`);
  });
  it('should create stories for a component using template', () => {
    const tree = runner.runSchematic('component', { name: 'foo/bar', project: 'baz', useTemplate: true }, appTree);
    expect(tree.readContent('/projects/baz/src/stories/foo/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';

storiesOf('foo/BarComponent', module)
  .add('default', () => ({
    template: \`<app-bar></app-bar>\`
  }));`);
  });
  it('should create stories for a component witch labeled with its tag string', () => {
    const tree = runner.runSchematic('component', { name: 'foo/bar', project: 'baz', tagAsLabel: true }, appTree);
    expect(tree.readContent('/projects/baz/src/stories/foo/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';
import { BarComponent } from '../../app/foo/bar/bar.component';

storiesOf('foo/<app-bar>', module)
  .add('default', () => ({
    component: BarComponent
  }));`);
  });
  it(`should replace the story's path if options.replacePath is given`, () => {
    const tree = runner.runSchematic(
      'component',
      {
        name: 'foo/bar',
        project: 'baz',
        replacePath: JSON.stringify([
          { from: '^foo/', to: 'abc/def/' },
          { from: '^([^/]+)/', to: '$1$1/' },
          { from: 'fooooooooooooooooooooooo', to: 'barrrrrrrrrrrrrrrr' }
        ])
      },
      appTree
    );
    expect(tree.files.indexOf('/projects/baz/src/stories/foo/bar.stories.ts') >= 0).toBe(false);
    expect(tree.readContent('/projects/baz/src/stories/abcabc/def/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';
import { BarComponent } from '../../../app/foo/bar/bar.component';

storiesOf('abcabc/def/BarComponent', module)
  .add('default', () => ({
    component: BarComponent
  }));`);
  });
  it(`should use the same dir as components if useComponentDir is true`, () => {
    const tree = runner.runSchematic(
      'component',
      {
        name: 'foo/bar',
        project: 'baz',
        useComponentDir: true
      },
      appTree
    );
    expect(tree.files.indexOf('/projects/baz/src/stories/foo/bar.stories.ts') >= 0).toBe(false);
    expect(tree.readContent('/projects/baz/src/app/foo/bar/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';
import { BarComponent } from './bar.component';

storiesOf('foo/BarComponent', module)
  .add('default', () => ({
    component: BarComponent
  }));`);
  });
  it(`should use the same dir as components if useComponentDir is true and replacePath is set`, () => {
    const tree = runner.runSchematic(
      'component',
      {
        name: 'foo/bar',
        project: 'baz',
        replacePath: JSON.stringify([
          { from: '^foo/', to: 'abc/def/' },
          { from: '^([^/]+)/', to: '$1$1/' },
          { from: 'fooooooooooooooooooooooo', to: 'barrrrrrrrrrrrrrrr' }
        ]),
        useComponentDir: true
      },
      appTree
    );
    expect(tree.files.indexOf('/projects/baz/src/stories/foo/bar.stories.ts') >= 0).toBe(false);
    expect(tree.files.indexOf('/projects/baz/src/stories/abcabc/def/bar.stories.ts') >= 0).toBe(false);
    expect(tree.readContent('/projects/baz/src/app/foo/bar/bar.stories.ts')).toBe(`import { storiesOf } from '@storybook/angular';
import { BarComponent } from './bar.component';

storiesOf('abcabc/def/BarComponent', module)
  .add('default', () => ({
    component: BarComponent
  }));`);
  });
  it('should not create stories for a component if noStory option is passed', () => {
    const tree = runner.runSchematic('component', { name: 'foo/bar', project: 'baz', noStory: true }, appTree);
    expect(tree.files.indexOf('/projects/baz/src/stories/foo/bar.stories.ts') >= 0).toBe(false);
  });
});
