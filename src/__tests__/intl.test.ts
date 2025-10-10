import { readFileSync } from 'fs'
import { join } from 'path'

describe('Internationalization Tests', () => {
	const contentPath = join(process.cwd(), 'content')
	
	// Test that JSON files exist and are valid
	describe('JSON content files', () => {
		const files = ['chvalotce.json', 'hallelujahhub.json']
		
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
		it('should have core translation sections in both files', () => {
			const chvalotcePath = join(contentPath, 'chvalotce.json')
			const hallelujahhubPath = join(contentPath, 'hallelujahhub.json')
			
			const chvalotceContent = JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			const hallelujahhubContent = JSON.parse(readFileSync(hallelujahhubPath, 'utf-8'))
			
			// Test that both files have core sections
			const coreKeys = ['common', 'navigation', 'home', 'auth']
			
			coreKeys.forEach(key => {
				expect(chvalotceContent).toHaveProperty(key)
				expect(hallelujahhubContent).toHaveProperty(key)
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

		it('should have core translation keys in both locales', () => {
			const chvalotcePath = join(contentPath, 'chvalotce.json')
			const hallelujahhubPath = join(contentPath, 'hallelujahhub.json')
			
			const chvalotceContent = JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			const hallelujahhubContent = JSON.parse(readFileSync(hallelujahhubPath, 'utf-8'))
			
			// Test that core translation keys exist in both files
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
				let chvalotceValue = chvalotceContent
				let hallelujahhubValue = hallelujahhubContent
				
				keys.forEach(key => {
					chvalotceValue = chvalotceValue?.[key]
					hallelujahhubValue = hallelujahhubValue?.[key]
				})
				
				expect(chvalotceValue).toBeDefined()
				expect(hallelujahhubValue).toBeDefined()
				expect(typeof chvalotceValue).toBe('string')
				expect(typeof hallelujahhubValue).toBe('string')
			})
		})
	})

	// Test content_version environment variable functionality
	describe('Content version switching', () => {
		// Mock the content version logic directly without using next-intl
		function getContentByVersion(contentVersion: string) {
			const chvalotcePath = join(process.cwd(), 'content', 'chvalotce.json')
			const hallelujahhubPath = join(process.cwd(), 'content', 'hallelujahhub.json')
			
			const version = contentVersion || 'chvalotce'
			
			if (version === 'chvalotce') {
				return JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			} else if (version === 'hallelujahhub') {
				return JSON.parse(readFileSync(hallelujahhubPath, 'utf-8'))
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

	// Test for common translation issues
	describe('Translation quality checks', () => {
		it('should not have empty translation strings', () => {
			const chvalotcePath = join(contentPath, 'chvalotce.json')
			const content = JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			
			function checkForEmptyStrings(obj: any, path = ''): string[] {
				const emptyKeys: string[] = []
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					if (typeof obj[key] === 'object' && obj[key] !== null) {
						emptyKeys.push(...checkForEmptyStrings(obj[key], currentPath))
					} else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
						emptyKeys.push(currentPath)
					}
				}
				return emptyKeys
			}
			
			const emptyKeys = checkForEmptyStrings(content)
			expect(emptyKeys).toHaveLength(0)
		})

		it('should have interpolation placeholders in correct format', () => {
			const chvalotcePath = join(contentPath, 'chvalotce.json')
			const content = JSON.parse(readFileSync(chvalotcePath, 'utf-8'))
			
			function checkInterpolations(obj: any, path = ''): string[] {
				const invalidInterpolations: string[] = []
				for (const key in obj) {
					const currentPath = path ? `${path}.${key}` : key
					if (typeof obj[key] === 'object' && obj[key] !== null) {
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
			
			const invalidInterpolations = checkInterpolations(content)
			expect(invalidInterpolations).toHaveLength(0)
		})
	})
})