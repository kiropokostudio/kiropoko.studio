import AppKit
import Foundation

struct CoverText {
  let lang: String
  let title: String
  let subtitle: String
  let titleSize: CGFloat
  let subtitleSize: CGFloat
}

let covers: [CoverText] = [
  CoverText(
    lang: "en",
    title: "It Wasn't a Chestnut Bur!",
    subtitle: "A Kiro and Poko Friendship Story",
    titleSize: 68,
    subtitleSize: 28
  ),
  CoverText(
    lang: "ja",
    title: "栗のいがじゃなかった！",
    subtitle: "キロとポコの友情のおはなし",
    titleSize: 64,
    subtitleSize: 30
  ),
  CoverText(
    lang: "zh-Hans",
    title: "原来不是栗子壳！",
    subtitle: "基罗和波可的友情故事",
    titleSize: 76,
    subtitleSize: 32
  )
]

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: swift generate-kiropoko-covers.swift <base-png> <output-dir>\n", stderr)
  exit(1)
}

let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)

guard let baseImage = NSImage(contentsOf: sourceURL) else {
  fputs("Could not open base image: \(sourceURL.path)\n", stderr)
  exit(1)
}

try FileManager.default.createDirectory(at: outputURL, withIntermediateDirectories: true)

func color(red: CGFloat, green: CGFloat, blue: CGFloat, alpha: CGFloat = 1) -> NSColor {
  NSColor(calibratedRed: red / 255, green: green / 255, blue: blue / 255, alpha: alpha)
}

func centeredParagraph(lineHeight: CGFloat) -> NSMutableParagraphStyle {
  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center
  paragraph.minimumLineHeight = lineHeight
  paragraph.maximumLineHeight = lineHeight
  return paragraph
}

func font(size: CGFloat, weight: NSFont.Weight) -> NSFont {
  NSFont.systemFont(ofSize: size, weight: weight)
}

for cover in covers {
  let canvas = NSImage(size: baseImage.size)
  let width = baseImage.size.width
  let height = baseImage.size.height

  canvas.lockFocus()

  baseImage.draw(in: NSRect(x: 0, y: 0, width: width, height: height))

  let panelRect = NSRect(x: 54, y: height - 242, width: width - 108, height: 200)
  let panelPath = NSBezierPath(roundedRect: panelRect, xRadius: 30, yRadius: 30)
  color(red: 151, green: 220, blue: 235, alpha: 0.98).setFill()
  panelPath.fill()

  let titleShadow = NSShadow()
  titleShadow.shadowColor = color(red: 255, green: 243, blue: 209, alpha: 0.85)
  titleShadow.shadowBlurRadius = 0
  titleShadow.shadowOffset = NSSize(width: 3, height: -3)

  let titleStyle = centeredParagraph(lineHeight: cover.titleSize * 1.04)
  let titleAttributes: [NSAttributedString.Key: Any] = [
    .font: font(size: cover.titleSize, weight: .heavy),
    .foregroundColor: color(red: 214, green: 101, blue: 18),
    .paragraphStyle: titleStyle,
    .shadow: titleShadow
  ]

  let subtitleStyle = centeredParagraph(lineHeight: cover.subtitleSize * 1.18)
  let subtitleAttributes: [NSAttributedString.Key: Any] = [
    .font: font(size: cover.subtitleSize, weight: .bold),
    .foregroundColor: color(red: 82, green: 66, blue: 48),
    .paragraphStyle: subtitleStyle
  ]

  NSString(string: cover.title).draw(
    with: NSRect(x: 110, y: height - 150, width: width - 220, height: 88),
    options: [.usesLineFragmentOrigin, .usesFontLeading],
    attributes: titleAttributes
  )

  NSString(string: cover.subtitle).draw(
    with: NSRect(x: 120, y: height - 206, width: width - 240, height: 44),
    options: [.usesLineFragmentOrigin, .usesFontLeading],
    attributes: subtitleAttributes
  )

  canvas.unlockFocus()

  guard let tiffData = canvas.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiffData),
        let pngData = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Could not render cover for \(cover.lang)\n", stderr)
    exit(1)
  }

  let destination = outputURL.appendingPathComponent("cover-\(cover.lang)-1280.png")
  try pngData.write(to: destination)
}
