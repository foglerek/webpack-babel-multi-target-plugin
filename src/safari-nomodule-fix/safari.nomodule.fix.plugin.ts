import { readFileSync } from 'fs'
import { resolve } from 'path'

import { AlterAssetTagsData, HtmlTag, HtmlWebpackPlugin } from 'html-webpack-plugin'
import * as webpack from 'webpack'
import { Compiler, Plugin } from 'webpack'
import { RawSource } from 'webpack-sources'

import Compilation = webpack.compilation.Compilation;

import { SafariNoModuleFix, SafariNoModuleFixOption } from '../babel.multi.target.options'
import { PLUGIN_NAME } from '../plugin.name'

import { SafariNoModuleFixDependency } from './safari.nomodule.fix.dependency'

export class SafariNoModuleFixPlugin implements Plugin {

  constructor(private mode: SafariNoModuleFixOption) {}

  public apply(compiler: Compiler): void {
    compiler.hooks.afterPlugins.tap(PLUGIN_NAME, () => {

      if (this.mode === SafariNoModuleFix.external) {
        this.initExternal(compiler)
      }

      this.initHtmlUpdate(compiler)

      return compiler
    })
  }

  private initExternal(compiler: Compiler): void {
    // set up the dependency to be handled by the NormalModuleFactory
    // compiler.hooks.compilation.tap(
    //   this.constructor.name,
    //   (compilation: Compilation, { normalModuleFactory }: { normalModuleFactory: NormalModuleFactory }) => {
    //     (compilation.dependencyFactories as Map<any, any>).set(
    //       SafariNoModuleFixDependency,
    //       normalModuleFactory
    //     );
    //   }
    // );
    //
    // // add the nomodule fix file as an additional entry so that it gets put into its own file
    // compiler.hooks.make.tapPromise(PLUGIN_NAME, (compilation: Compilation) => {
    //   const dep = new SafariNoModuleFixDependency();
    //   return new Promise((resolve, reject) => compilation.addEntry(dep.context, dep, dep.filename, (err: Error) => {
    //     if (err) {
    //       return reject();
    //     }
    //     resolve();
    //   }));
    // });

    /**
     * add the nomodule fix script as an additionalAsset
     * This has the benefit of avoiding the webpack bootstrap boilerplate getting added, which would be completely
     * useless and wasted bytes since it's not going to be loading any other dependencies. However, it also means skipping
     * the rest of the JS infrastructure, so no loaders or uglificiation :(
     *
     * TODO: maybe it's possible to conditionally mess with the mainTemplate so that it can be loaded like a real entry, but skip all the boilerplate
     */
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: Compilation) => {

      if (!compilation.name) {
        return
      }

      compilation.hooks.additionalAssets.tapPromise(PLUGIN_NAME, async () => {
        compilation.assets[SafariNoModuleFixDependency.filename] = new RawSource(readFileSync(SafariNoModuleFixDependency.path, 'utf-8'))
        return
      })

      const htmlWebpackPlugin: HtmlWebpackPlugin = compiler.options.plugins
      // instanceof can act wonky since we don't actually keep our own dependency on html-webpack-plugin
      // should we?
        .find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin') as any

      if (!htmlWebpackPlugin) {
        return
      }
    })
  }

  private initHtmlUpdate(compiler: Compiler): void {
    const htmlWebpackPlugin: HtmlWebpackPlugin = compiler.options.plugins
    // instanceof can act wonky since we don't actually keep our own dependency on html-webpack-plugin
    // should we?
      .find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin') as any

    if (!htmlWebpackPlugin) {
      return
    }

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: Compilation) => {

      if (compilation.name) {
        return
      }

      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapPromise(`${PLUGIN_NAME} add safari nomodule fix tags`,
        async (htmlPluginData: AlterAssetTagsData) => {
          htmlPluginData.head.unshift(this.createSafariNoModuleFixTag())
          return htmlPluginData
        })

    })
  }

  private createSafariNoModuleFixTag(): HtmlTag {

    // TODO: minify the nomodule fix js
    const tag: HtmlTag  = {
      tagName: 'script',
      closeTag: true,
      attributes: {
        nomodule: true,
        type: 'application/javascript',
      },
    }

    if (this.mode === SafariNoModuleFix.external) {
      tag.attributes.src = '/' + SafariNoModuleFixDependency.filename
      return tag
    }

    const fixContent = readFileSync(resolve(__dirname, 'safari.nomodule.fix.js'))

    if (this.mode === true || this.mode === SafariNoModuleFix.inline) {
      tag.innerHTML = fixContent
        .toString('utf-8')
      return tag
    }

    tag.attributes.src = 'data:application/javascript'
    const isBase64 = this.mode === SafariNoModuleFix.inlineDataBase64
    if (isBase64) {
      tag.attributes.src += `;base64,${fixContent.toString('base64')}`
      return tag
    }

    tag.attributes.src += ',' + encodeURIComponent(fixContent.toString('utf-8')
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' '))
    return tag
  }

}
