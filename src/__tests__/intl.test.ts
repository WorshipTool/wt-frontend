import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Internationalization Tests', () => {
	const contentPath = join(process.cwd(), 'content')
	
	// Dynamically discover all JSON files in content folder
	const getAllJsonFiles = (): string[] => {
		return readdirSync(contentPath)
			.filter(file => file.endsWith('.json'))
			.sort()
	}
	
	// Test that JSON files exist and are valid
	describe('JSON content files', () => {
		const files = getAllJsonFiles()
		
		files.forEach(filename => {
			it(`should have valid JSON structure in ${filename}`, () => {
				const filePath = join(contentPath, filename)
				const fileContent = readFileSync(filePath, 'utf-8')
				
				// Test that JSON can be parsed without errors
				expect(() => JSON.parse(fileContent)).not.toThrow()
				
				const parsedContent = JSON.parse(fileContent)
				
				// Test that it's an object with nested structure
				expect(typeof parsedContent).toBe('object')
				expect(parsedContent).not.toBeNull()
				
				// Test that it has some expected top-level keys
				expect(parsedContent).toHaveProperty('common')
				expect(parsedContent).toHaveProperty('navigation')
				expect(parsedContent).toHaveProperty('home')
			})
		})
	})

	// Test that TypeScript definition matches JSON content
	describe('TypeScript definitions consistency', () => {
		it('should have core translation sections in all files', () => {
			const files = getAllJsonFiles()
			const contents = files.map(file => ({
				filename: file,
				content: JSON.parse(readFileSync(join(contentPath, file), 'utf-8'))
			}))
			
			// Test that all files have core sections
			const coreKeys = ['common', 'navigation', 'home', 'auth']
			
			contents.forEach(({ filename, content }) => {
				coreKeys.forEach(key => {
					expect(content).toHaveProperty(key)
				})
			})
		})
	})

	// Test next-intl functionality
	describe('next-intl integration', () => {
		it('should have valid locale structure', () => {
			const chvalotcePath = join(contentPath, 'chvalotce.json')
			const content = JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			
			// Test nested translation keys
			expect(content.common).toHaveProperty('yes')
			expect(content.common).toHaveProperty('no')
			expect(content.common).toHaveProperty('cancel')
			
			// Test that translation values are strings
			expect(typeof content.common.yes).toBe('string')
			expect(typeof content.common.no).toBe('string')
			expect(typeof content.common.cancel).toBe('string')
		})

		it('should have core translation keys in all locales', () => {
			const files = getAllJsonFiles()
			const contents = files.map(file => ({
				filename: file,
				content: JSON.parse(readFileSync(join(contentPath, file), 'utf-8'))
			}))
			
			// Test that core translation keys exist in all files
			const coreTranslationPaths = [
				'common.yes',
				'common.no',
				'common.save',
				'navigation.home',
				'navigation.songs',
				'auth.login.title'
			]
			
			coreTranslationPaths.forEach(path => {
				const keys = path.split('.')
				
				contents.forEach(({ filename, content }) => {
					let value = content
					
					keys.forEach(key => {
						value = value?.[key]
					})
					
					expect(value).toBeDefined()
					expect(typeof value).toBe('string')
				})
			})
		})
	})

	// Test content_version environment variable functionality
	describe('Content version switching', () => {
		// Mock the content version logic directly without using next-intl
		function getContentByVersion(contentVersion: string) {
			const files = getAllJsonFiles()
			const version = contentVersion || 'chvalotce'
			
			// Remove .json extension for comparison
			const versionFile = `${version}.json`
			
			if (files.includes(versionFile)) {
				const filePath = join(process.cwd(), 'content', versionFile)
				return JSON.parse(readFileSync(filePath, 'utf-8'))
			} else {
				throw new Error(`Content version "${version}" not found`)
			}
		}

		it('should return different content based on content version', () => {
			// Test chvalotce version
			const chvalotceContent = getContentByVersion('chvalotce')
			
			// Test hallelujahhub version
			const hallelujahhubContent = getContentByVersion('hallelujahhub')

			// Verify that different content is returned
			expect(chvalotceContent).toBeDefined()
			expect(hallelujahhubContent).toBeDefined()

			// Test specific strings that differ between versions
			expect(chvalotceContent.home.hero.title).toBe('Chval Otce')
			expect(hallelujahhubContent.home.hero.title).toBe('HallelujahHub')

			expect(chvalotceContent.home.hero.subtitle).toBe('Na worship.cz')
			expect(hallelujahhubContent.home.hero.subtitle).toBe('Your worship companion')

			// Test other differences
			expect(chvalotceContent.home.hero.lead).toBe('Jsi-li ovce, tak...')
			expect(hallelujahhubContent.home.hero.lead).toBe('Welcome to...')
		})

		it('should default to chvalotce when content version is undefined', () => {
			const defaultContent = getContentByVersion('')
			
			// Should default to chvalotce content
			expect(defaultContent.home.hero.title).toBe('Chval Otce')
			expect(defaultContent.home.hero.subtitle).toBe('Na worship.cz')
		})

		it('should handle invalid content version gracefully', () => {
			// Should throw an error for non-existent version
			expect(() => getContentByVersion('nonexistent')).toThrow('Content version "nonexistent" not found')
		})

		it('should simulate CONTENT_VERSION environment variable logic', () => {
			// Simulate the logic from i18n/request.ts
			function simulateContentVersionLogic(envVar?: string) {
				const contentVersion = envVar || 'chvalotce'
				return getContentByVersion(contentVersion)
			}

			// Test with explicit chvalotce
			const chvalotceResult = simulateContentVersionLogic('chvalotce')
			expect(chvalotceResult.home.hero.title).toBe('Chval Otce')

			// Test with hallelujahhub
			const hallelujahhubResult = simulateContentVersionLogic('hallelujahhub')
			expect(hallelujahhubResult.home.hero.title).toBe('HallelujahHub')

			// Test with undefined (should default)
			const defaultResult = simulateContentVersionLogic()
			expect(defaultResult.home.hero.title).toBe('Chval Otce')
		})
	})

	// Test that all JSON files have identical structure
	describe('JSON structure consistency', () => {
		it('should have identical structure across all JSON files', () => {
			const files = getAllJsonFiles()
			const contents = files.map(file => ({
				filename: file,
				content: JSON.parse(readFileSync(join(contentPath, file), 'utf-8'))
			}))
			
			function getStructure(obj: any, path = ''): string[] {
				const keys: string[] = []
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					keys.push(currentPath)
					if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
						keys.push(...getStructure(obj[key], currentPath))
					}
				}
				return keys.sort()
			}
			
			// Get structure from the first file as reference
			const referenceFile = contents[0]
			const referenceStructure = getStructure(referenceFile.content)
			
			// Compare all other files against the reference
			contents.slice(1).forEach(({ filename, content }) => {
				const currentStructure = getStructure(content)
				
				// Compare structures
				try {
					expect(currentStructure).toEqual(referenceStructure)
				} catch (error) {
					// If structures don't match, show detailed differences
					const missingKeys = referenceStructure.filter(key => !currentStructure.includes(key))
					const extraKeys = currentStructure.filter(key => !referenceStructure.includes(key))
					
					console.error(`Structure mismatch in ${filename}:`)
					if (missingKeys.length > 0) {
						console.error(`Missing keys:`, missingKeys)
					}
					if (extraKeys.length > 0) {
						console.error(`Extra keys:`, extraKeys)
					}
					throw error
				}
			})
		})
		
		it('should have matching value types for all keys across all files', () => {
			const files = getAllJsonFiles()
			const contents = files.map(file => ({
				filename: file,
				content: JSON.parse(readFileSync(join(contentPath, file), 'utf-8'))
			}))
			
			function getValueTypes(obj: any, path = ''): { [key: string]: string } {
				const types: { [key: string]: string } = {}
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					const value = obj[key]
					if (Array.isArray(value)) {
						types[currentPath] = 'array'
					} else if (value === null) {
						types[currentPath] = 'null'
					} else if (typeof value === 'object') {
						types[currentPath] = 'object'
						Object.assign(types, getValueTypes(value, currentPath))
					} else {
						types[currentPath] = typeof value
					}
				}
				return types
			}
			
			// Get types from the first file as reference
			const referenceFile = contents[0]
			const referenceTypes = getValueTypes(referenceFile.content)
			
			// Compare all other files against the reference
			contents.slice(1).forEach(({ filename, content }) => {
				const currentTypes = getValueTypes(content)
				
				// Check that all keys have the same types
				for (const key in referenceTypes) {
					expect(currentTypes[key]).toBeDefined()
					expect(currentTypes[key]).toBe(referenceTypes[key])
				}
				
				for (const key in currentTypes) {
					expect(referenceTypes[key]).toBeDefined()
					expect(referenceTypes[key]).toBe(currentTypes[key])
				}
			})
		})
		
		it('should have all interpolation placeholders consistent across files', () => {
			const files = getAllJsonFiles()
			const contents = files.map(file => ({
				filename: file,
				content: JSON.parse(readFileSync(join(contentPath, file), 'utf-8'))
			}))
			
			function getInterpolationKeys(obj: any, path = ''): { [key: string]: string[] } {
				const interpolations: { [key: string]: string[] } = {}
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
						Object.assign(interpolations, getInterpolationKeys(obj[key], currentPath))
					} else if (typeof obj[key] === 'string') {
						// Extract interpolation placeholders {variable}
						const matches = obj[key].match(/\{[^}]+\}/g) || []
						if (matches.length > 0) {
							interpolations[currentPath] = matches.sort()
						}
					}
				}
				return interpolations
			}
			
			// Get interpolations from the first file as reference
			const referenceFile = contents[0]
			const referenceInterpolations = getInterpolationKeys(referenceFile.content)
			
			// Compare all other files against the reference
			contents.slice(1).forEach(({ filename, content }) => {
				const currentInterpolations = getInterpolationKeys(content)
				
				// Check that interpolation keys match
				for (const path in referenceInterpolations) {
					if (currentInterpolations[path]) {
						expect(currentInterpolations[path]).toEqual(referenceInterpolations[path])
					} else {
						expect(currentInterpolations[path]).toBeDefined()
					}
				}
				
				for (const path in currentInterpolations) {
					expect(referenceInterpolations[path]).toBeDefined()
				}
			})
		})
	})

	// Test for common translation issues
	describe('Translation quality checks', () => {
		it('should not have empty translation strings in any file', () => {
			const files = getAllJsonFiles()
			
			function checkForEmptyStrings(obj: any, path = ''): string[] {
				const emptyKeys: string[] = []
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
						emptyKeys.push(...checkForEmptyStrings(obj[key], currentPath))
					} else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
						emptyKeys.push(currentPath)
					}
				}
				return emptyKeys
			}
			
			files.forEach(filename => {
				const content = JSON.parse(readFileSync(join(contentPath, filename), 'utf-8'))
				const emptyKeys = checkForEmptyStrings(content)
				expect(emptyKeys).toHaveLength(0)
			})
		})

		it('should have interpolation placeholders in correct format in all files', () => {
			const files = getAllJsonFiles()
			
			function checkInterpolations(obj: any, path = ''): string[] {
				const invalidInterpolations: string[] = []
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
						invalidInterpolations.push(...checkInterpolations(obj[key], currentPath))
					} else if (typeof obj[key] === 'string') {
						// Check for next-intl interpolation format {variable}
						const interpolationMatches = obj[key].match(/\{[^}]+\}/g)
						if (interpolationMatches) {
							interpolationMatches.forEach((match: string) => {
								// Check if interpolation has valid format
								if (!/^\{[a-zA-Z][a-zA-Z0-9_]*\}$/.test(match)) {
									invalidInterpolations.push(`${currentPath}: ${match}`)
								}
							})
						}
					}
				}
				return invalidInterpolations
			}
			
			files.forEach(filename => {
				const content = JSON.parse(readFileSync(join(contentPath, filename), 'utf-8'))
				const invalidInterpolations = checkInterpolations(content)
				expect(invalidInterpolations).toHaveLength(0)
			})
		})

		it('should have consistent branding across all files', () => {
			const files = getAllJsonFiles()
			const expectedBrandings: { [filename: string]: { appName: string, email: string } } = {
				'chvalotce.json': { appName: 'Chvalotce.cz', email: 'chvalotce@chvalotce.cz' },
				'hallelujahhub.json': { appName: 'HallelujahHub', email: 'contact@hallelujahhub.com' },
				'chwalmy.json': { appName: 'Chwalmy.com', email: 'kontakt@chwalmy.com' }
			}
			
			files.forEach(filename => {
				const content = JSON.parse(readFileSync(join(contentPath, filename), 'utf-8'))
				const expected = expectedBrandings[filename]
				
				if (expected) {
					expect(content.config?.branding?.appName).toBe(expected.appName)
					expect(content.config?.contact?.main).toBe(expected.email)
				}
			})
		})

		it('should have all content files properly registered', () => {
			const files = getAllJsonFiles()
			const expectedFiles = ['chvalotce.json', 'hallelujahhub.json', 'chwalmy.json']
			
			expectedFiles.forEach(expectedFile => {
				expect(files).toContain(expectedFile)
			})
		})
	})
})