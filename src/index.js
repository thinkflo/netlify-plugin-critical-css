import walkSync from 'walk-sync'
import { generate } from 'critical'
import { PromisePool } from '@supercharge/promise-pool'

const progressUnits = 20
const cursor = {
  cr: '\r',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
}

const updateProgressBar = (
  index,
  total,
  status = 'success',
  currentPage = null,
) => {
  const percentage = Number(index / total)
  const progress = Number(percentage * progressUnits).toFixed(0)
  switch (status) {
    case 'error':
      console.log(
        `${cursor.cr}${cursor.white}${cursor.dim}[${'█'.repeat(
          progress,
        )}${' '.repeat(progressUnits - progress)}] ${(percentage * 100).toFixed(
          2,
        )}% ${cursor.bright}${
          cursor.red
        }Unable to generate Critical CSS for: ${currentPage}${cursor.white}${
          cursor.bright
        }`,
      )
      break
    default:
      process.stdout.write(
        `${cursor.cr}${cursor.white}${cursor.dim}[${'█'.repeat(
          progress,
        )}${' '.repeat(progressUnits - progress)}] ${(percentage * 100).toFixed(
          2,
        )}% Complete${cursor.bright}`,
      )
  }
}

const pluralize = (number) => (number === 1 ? '' : 's')

export const onPreBuild = async ({ constants, inputs }) => {
  const {
    silent = false,
    showProgressBar = true,
    base = constants.PUBLISH_DIR ?? 'build',
    globs = ['**/*.html'],
    ignore = ['node_modules', '_app', '_next'],
    dimensions = [
      { width: 375, height: 1200 },
      { width: 1024, height: 1400 },
      { width: 1280, height: 1500 }
    ],
    ignoreCssRules = ['@font-face'],
    concurrency = process.env?.['NETLIFY'] ? 3 : 1,
    taskTimeout = 2000,
  } = inputs

  const pages = walkSync(base, {
    globs,
    directories: false,
    ignore,
    includeBasePath: false,
  })

  if (!silent)
    console.log(
      `${cursor.white}${cursor.bright}${pages.length} built page${pluralize(
        pages.length,
      )} found for Critical CSS rendering`,
    )
  if (!silent)
    console.log(
      `${cursor.white}${
        cursor.bright
      }Starting Critical CSS rendering using ${concurrency} concurrent task${pluralize(
        concurrency,
      )}`,
    )

  await PromisePool.withConcurrency(concurrency)
    .for(pages)
    .withTaskTimeout(taskTimeout)
    .process(async (page, index) => {
      if (!silent && showProgressBar) updateProgressBar(index, pages.length)
      await generate({
        inline: true,
        base,
        src: page,
        target: {
          html: page,
        },
        dimensions,
        ignore: ignoreCssRules,
      }).catch(() => {
        if (!silent && showProgressBar)
          updateProgressBar(index, pages.length, 'error', page)
      })
    })

  if (!silent)
    console.log(
      `${cursor.white}${cursor.bright}Finished Critical CSS rendering`,
    )
}
